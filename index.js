var map = require('map-stream')
  , stripbom = require('strip-bom')
  , File = require('vinyl')
  , multipipe = require('multipipe')
  , mime = require('mime-types')
  , fs = require('fs')
  , path = require('path');

/**
 * factory(cwd, reg)
 * factory(cwd, fix)
 * factory(cwd, reg, fix)
 * Create a connect-pipe-middleware
 * @param {String} cwd All `src` matches are relative to this path 
 * @param {RegExp} reg Request url must match this RegExp
 * @param {Function} fix The function will fix the url
 * @returns {Function} middleware A connect middleware
 */

function factory(cwd, reg, fix) {
  var streams
    , streamList = []
    , uid = 0
    , callbacks = {};
  
  // factory(cwd, fix)
  if (!fix && typeof reg === 'function') {
    fix = reg;
    reg = null;
  }

  function pipe(stream) {
    streamList.push(stream);
    return this;
  }

  function stream(local, fn) {
    callbacks[++uid + ''] = fn;

    var stream = 
      stripbom.stream()
        .pipe(format(local, uid));
    fs.readFile(local, function (err, buffer) {
      stream.write(buffer);
    });

    return stream;
  }

  function format(local, uid) {
    var file = new File({ path: local });

    file.uid = uid;

    return map(function (buf, fn) {
      file.contents = buf;
      streams.write(file);
    });
  }

  // cp(connect-pipe-middleware)
  function cp(req, res, next) {
    if (reg && !reg.test(req.url)) return next();
    var local = path.join(cwd, fix ? fix(req.url) : req.url);
    fs.exists(local, function (exists) {
      if (!exists) return next();
      stream(local, function (err, data) {
        if (err) return next(err);
        res.writeHead(200, { 'Content-Type': mime.contentType(mime.lookup(req.url)) });
        res.statusCode = 200;
        res.end(data);
      });
    });
  }

  /**
   * pipe
   * Actually it just push the stream factory to the stream factory list
   * @param {Function} streamFactory
   */
  cp.pipe = pipe;

  setImmediate(function () {
    streamList.push(map(function (file) {
      var uids = file.uid + ''
        , fn = callbacks[uids];
      if (fn) {
        fn(null, file.contents);
        callbacks[uids] = null;
        delete callbacks[uids];
      }
    }));
    streams = streamList[0];
    for (var i = 1, l = streamList.length; i < l; i++) {
      streams.pipe(streamList[i]);
    }
  });

  return cp;
}

module.exports = factory;