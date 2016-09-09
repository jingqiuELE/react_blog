/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var COMMENTS_FILE = path.join(__dirname, 'comments.json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
 
var mongo_url = 'mongodb://localhost:27017/myproject';

var insertDocuments = function(db, docs, callback) {
  var collection = db.collection('documents');
  collection.insert(docs, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted %d documents into the document collection", docs.length);
    callback(err, result);
  });
}

var findDocuments = function(db, callback) {
  var collection = db.collection('documents');
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/blogs', (req, res) => {
  MongoClient.connect(mongo_url, (err, db) => {
    assert.equal(null, err);
    findDocuments(db, (docs) => res.json(docs));
    db.close();
  });
});

app.post('/api/blogs', (req, res) => {
  MongoClient.connect(mongo_url, (err, db) => {
    assert.equal(null, err);
    var newBlog = {
      id: Date.now(),
      author: req.body.author,
      text: req.body.text,
    };
    insertDocuments(db, newBlog, (err, result) => {
      if (err) {
          console.error(err);
      } 
      db.close();
    });
  });
});


app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
