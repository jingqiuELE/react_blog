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
var BlogDB = require('./blog');

var app = express();
var DBNAME = "myblog";
var blogdb = new BlogDB({database: DBNAME});
 
 

var insertDocuments = function(db, docs, callback) {
  var collection = db.collection('blogs');
  collection.insert(docs, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted %d documents into the document collection", docs.length);
    callback(err, result);
  });
}

var findDocuments = function(db, callback) {
  var collection = db.collection('blogs');
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
  blogdb.load((err) => {
    if (err) {
      console.log("Failed to load blogs from mongodb.");
    }
    blogdb.getBlogList((err, blogs) => res.json(blogs)); 
  }); 
});

app.post('/api/blogs', (req, res) => {
  blogdb.load((err) => {
    if (err) {
        console.log("Failed to load blogs from mongodb.");
    }
    var id = req.body.id;
    var title = req.body.title;
    var text = req.body.text;
    blogdb.addBlog(id, title, text, (err, result) => {
      if (err) {
        console.error(err);
      } 
      blogdb.getBlogList((err, blogs) => res.json(blogs)); 
    });
  }); 
});


app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
