var connect = require('connect')
  , pipe = require('../')
  , insert = require('gulp-insert');

var app = connect()
            .use(pipe('./src/').pipe(function () {
              return insert.append('lallalala');
            }))
            .listen(3000);