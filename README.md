middleware-pipe
===============

Use gulp plugins in connect heavily inspired by file-pipe

Setup
-----

    $ npm install middleware-pipe

Useage
------

```javascript
var connect = require('connect')
  , pipeMiddle = require('middleware-pipe')
  , insert = require('gulp-insert');

var app = connect()
            // use middleware-pipe
            .use(pipeMiddle('./src')
                // it can get the request
                .pipe(function (req) {
                    // insert 'hello world!' to every response body
                    return insert.append('hello world!');
                }))
            .listen(3000);
```

API
---

```javascript
/**
 * middleware(path, reg)
 * middleware(path, fix)
 * middleware(path, reg, fix)
 * Create a connect-pipe-middleware
 * @param {String} cwd All `src` matches are relative to this path 
 * @param {RegExp} reg Request url must match this RegExp
 * @param {Function} fix The function will fix the url
 * @returns {Function} middleware A connect middleware
 */
// match html file
middleware('./src', /\.html$/)

// match css file, and find the source of less
middleware('./src', /\.css$/, function (url) {
    return url.replace(/.css$/, '.less');
})

```

Sample
-------

https://github.com/miniflycn/middleware-pipe-sample


License
-------

(The MIT License)

Copyright (c) 2013 Daniel Yang <miniflycn@justany.net>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
