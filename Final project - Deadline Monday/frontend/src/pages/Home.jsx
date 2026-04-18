import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/blog.css';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!token);
    setUserRole(role || 'user');
    setCurrentUserId(userId);

    // Fetch all posts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/posts`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWritePost = () => {
    if (isAuthenticated) {
      navigate('/write-post');
    } else {
      navigate('/login');
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/write-post/${postId}`);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const canEditPost = (post) => {
    return isAuthenticated && (post.authorId === currentUserId || userRole === 'admin');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Welcome to the Community Blog!</h1>
          <p>Join me on my Journey and Explore the world of the Unidentified Artist</p>
          <img src="/Edvir.jpg" alt="Hero Image" className="hero-image" />
          <div className="hero-actions">
            <button onClick={handleWritePost} className="btn-primary">
              {isAuthenticated ? 'Write Post' : 'Sign In to Write Post'}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="text-center">About the Artist</h2>
          <ul>
            <li>Video Editor | Layout Artist | Photographer</li>
            <li>Student Leader</li>
            <li>Student Athlete</li>
            <li>Taekwondo Blackbelt</li>
            <li>Coffee Lover</li>
          </ul>
        </div>
      </section>

      <section className="blog-feed">
        <div className="container">
          <h2>Community Blog Posts</h2>

          {/* Search Bar */}
          <div className="search-filter-bar">
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Posts Display */}
          {isLoading ? (
            <div className="loading">Loading posts...</div>
          ) : filteredPosts.length > 0 ? (
            <div className="posts-grid">
              {filteredPosts.map(post => (
                <article key={post._id} className="post-card">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="post-card-image" />
                  )}
                  <div className="post-card-content">
                    <h3>{post.title}</h3>
                    <p className="post-meta">
                      By {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <p className="post-excerpt">{post.content.substring(0, 150)}...</p>

                    <div className="post-card-actions">
                      <Link to={`/post/${post._id}`} className="btn-secondary">
                        Read More
                      </Link>
                      {canEditPost(post) && (
                        <>
                          <button 
                            onClick={() => handleEditPost(post._id)}
                            className="btn-secondary btn-edit"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post._id)}
                            className="btn-danger btn-small"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <p>No posts found. {isAuthenticated ? 'Be the first to write one!' : 'Sign in to write a post!'}</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="container">
          <h2>Featured Portfolio</h2>
          <div className="preview-grid">
            <div className="preview-card">
              <h3>Video Editing</h3>
              <p>Creative video productions and editing services.</p>
            </div>
            <div className="preview-card">
              <h3>Photography</h3>
              <p>Capturing moments and creating visual stories.</p>
            </div>
            <div className="preview-card">
              <h3>Graphic Design</h3>
              <p>Designing layouts and visual content.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;