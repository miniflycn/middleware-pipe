var middlePipe = require('../')
  , connect = require('connect')
  , valid = require('url-valid')
  , insert = require('gulp-insert')
  , path = require('path')
  , http = require('http');

connect()
  .use('/html',
    middlePipe(path.join(__dirname, 'src'))
      .pipe(insert.prepend('hello '))
  ).use('/js',
    middlePipe(path.join(__dirname, 'src'), /\.js$/)
      .pipe(insert.prepend('hello '))
  ).use('/tpl',
    middlePipe(path.join(__dirname, 'src'), function (url) {
      return url.replace(/\.tpl$/, '.html');
    }).pipe(insert.prepend('hello '))
  ).listen(3000);

describe('middleware-pipe', function () {
  it('should able to return hello world!', function (done) {
    valid('http://localhost:3000/html/index.html?key=value')
      .on('data', function (err, data) {
        data.toString().should.equal('hello world!');
        done();
      });
  });

  it('should not able to return the stream which do not match the RegExp', function (done) {
    valid('http://localhost:3000/js/index.html')
      .on('check', function (err, check) {
        check.should.be.false;
        done();
      });
  });

  it('should able to replace the url', function (done) {
    valid('http://localhost:3000/tpl/index.tpl')
      .on('data', function (err, data) {
        data.toString().should.equal('hello world!');
        done();
      });
  });
});
