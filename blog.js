/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var DB = require('./mongodb');


/*
 * Options:
 * - hostname: The MongoDB server hostname. Default: 'localhost'
 * - port: The MongoDB server port. Default: 27017
 * - database: The MongoDB database. Default: 'user_management'
 */
module.exports = function(options) {

  options = options || {};

  var loaded = false;
  var db = new DB(options);

  var COLLECTION = 'blogs';

  this.load = function load(cb) {
    if (loaded) {
      console.warn('blogs already loaded. Not reloading');
      return;
    }
    db.connect(function(err) {
      if (err) {
        cb(err);
        return;
      }
      db.loadCollection(COLLECTION, function(err) {
        if (err) {
          cb(err);
          return;
        }
        loaded = true;
        cb(null);
      });
    });
  };

  this.close = function close(cb) {
    db.disconnect(cb);
  };

  this.getBlogList = function getBlogList(cb) {
    if (!loaded) {
      throw new Error('Cannot call "blogExists" on unloaded object');
    }
    db.findAll(COLLECTION, function(err, items) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, (items || []));
    })
  };

  this.addBlog = function addBlog(id, title, content, url, author, extras, cb) {
    if (!loaded) {
      throw new Error('Cannot call "createBlog" on unloaded object');
    }
    db.create(COLLECTION, {
          id: id,
          title: title,
          content: content,
          url: url,
          author: author,
          extras: extras
    }, cb);
  };

  this.removeBlog = function removeBlog(id, cb) {
    if (!loaded) {
      throw new Error('Cannot call "removeBlog" on unloaded object');
    }
    db.delete(COLLECTION, { id: id }, function(err) {
      cb(err);
    });
  };


  function getExtras(filter, cb) {
    if (!loaded) {
      throw new Error('Cannot call "getExtras" on unloaded object');
    }
    db.find(COLLECTION, filter, function(err, item) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, item && item.extras);
    });
  }

  function setExtras(filter, value, cb) {
    if (!loaded) {
      throw new Error('Cannot call "setExtras" on unloaded object');
    }
    db.update(COLLECTION, filter, { extras: value }, cb);
  }
}
