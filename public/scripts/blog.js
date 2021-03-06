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

var Blog = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function() {
    var d = new Date(this.props.date);
    return (
      <div className="blog-post">
        <h2 className="blog-post-title">{this.props.title}</h2>
        <p className="blog-post-meta">
          {d.toString()}
          <a href='#'></a>
        </p>
          <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var BlogBox = React.createClass({
  loadBlogsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleBlogSubmit: function(blog) {
    var blogs = this.state.data;
    // Optimistically set an id on the new blog. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    blog.id = Date.now();
    var newBlogs = blogs.concat([blog]);
    this.setState({data: newBlogs});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(blog),
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: blogs});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadBlogsFromServer();
    setInterval(this.loadBlogsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <main>
        <div className="container">
          <div className="blog-header">
            <h1 className="blog-title">Blogs</h1>
            <p className="lead blog-description">Blogs implemented using React</p>
          </div>
          <BlogList data={this.state.data} />
          <BlogForm onBlogSubmit={this.handleBlogSubmit} />
        </div>
      </main>
    );
  }
});

var BlogList = React.createClass({
  render: function() {
    var blogNodes = this.props.data.map(function(blog) {
      return (
        <Blog date={blog.id} key={blog.id} title={blog.title}>
          {blog.text}
        </Blog>
      );
    });
    return (
      <div className="row">
        <div className="col-sm-8 blog-main">
        {blogNodes}
        </div>
      </div>
    );
  }
});

var BlogForm = React.createClass({
  getInitialState: function() {
      return {title: '', text: ''};
  },
  handleTitleChange: function(e) {
      this.setState({title: e.target.value});
  },
  handleTextChange: function(e) {
      this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title.trim();
    var text = this.state.text.trim();
    if (!text || !title) {
      return;
    }
    this.props.onBlogSubmit({title: title, text: text});
    this.setState({title: '', text: ''});
  },
  render: function() {
    return (
      <form className="blogForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Title..."
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <br />
        <textarea
          name="blog"
          className="newblog"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <br />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Header = React.createClass({
  render: function() {
    return (
      <header>
        <nav className="navbar navbar-light">
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#">login</a></li>
              <li className="nav-item">
                <a className="nav-link" href="#">register</a></li>
            </ul> 
            <form className="form-inline pull-xs-right">
              <input className="form-control" type="search" name="q" placeholder="Search query"/>
              <input className="btn btn-outline-success" type="submit" value="Go!"/>
            </form>
          </div>
        </nav>
      </header>
    );
  }
});

var MainBox = React.createClass({
  render: function() {
    return (
      <div>
         <Header />
         <BlogBox url="/api/blogs" pollInterval={10000} />
      </div>
    );
  }
});

ReactDOM.render(
  <MainBox />,
  document.getElementById('body')
);
