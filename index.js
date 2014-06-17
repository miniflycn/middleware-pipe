var map = require('map-stream')
  , stripbom = require('strip-bom')
  , File = require('vinyl')
  , multipipe = require('multipipe')
  , mime = require('mime-types')
  , fs = require('fs')
  , p = require('path');

function factory(path, reg, fix) {
  var _path = path
    , _reg = reg
    , _fix = fix
    , _streams = [];

  function pipe(streamFactory) {
    _streams.push(streamFactory);
    return this;
  }

  function stream(path) {
    return fs.createReadStream(path, 'utf8')
      .pipe(stripbom.stream())
      .pipe(format(path));
  }

  function format(path) {
    var file = new File({ path: path });

    return map(function (buf, fn) {
      file.contents = buf;
      fn(null, file);
    });
  }

  function run(path, req, fn) {
    var s = stream(path)
      , streamList = []
      , streams

    _streams.forEach(function (foo) {
      streamList.push(foo(req));
    });

    streams = multipipe.apply(null, streamList);

    streams.on('error', function (err) {
      fn && fn(err);
    });

    function done(file, end) {
      fn && fn(null, file.contents.toString());
      end();
    }

    return s.pipe(streams)
            .pipe(map(done));
  }

  function cp(req, res, next) {
    if (_reg && !_reg.test(req.url)) return next();
    var path = p.join(_path, _fix ? _fix(req.url) : req.url);
    fs.exists(path, function (exists) {
      if (!exists) return next();
      run(path, req, function (err, data) {
        if (err) return next(err);
        res.writeHead(200, { 'Content-Type': mime.contentType(mime.lookup(req.url)) });
        res.statusCode = 200;
        res.end(data);
      });
    });
  }

  cp.pipe = pipe;

  return cp;
}

module.exports = factory;
