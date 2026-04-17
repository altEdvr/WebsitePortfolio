import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!token);
    setUserRole(role || 'user');
    setCurrentUserId(userId);

    // Fetch post data from API
    fetchPost(postId);
  }, [postId]);

  const fetchPost = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
      const data = await response.json();
      if (data.success) {
        setPost(data.post);
      } else {
        setDeleteError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setDeleteError('Error loading post');
    } finally {
      setIsLoading(false);
    }
  };

  const canEditPost = () => {
    return isAuthenticated && (post?.authorId === currentUserId || userRole === 'admin');
  };

  const handleEditPost = () => {
    navigate(`/write-post/${postId}`);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        navigate('/home');
      } else {
        setDeleteError(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteError('Error deleting post');
    }
  };

  if (isLoading) {
    return <div className="container" style={{ padding: '50px 0', textAlign: 'center' }}>Loading post...</div>;
  }

  if (deleteError || !post) {
    return (
      <div className="container" style={{ padding: '50px 0', textAlign: 'center' }}>
        <p>{deleteError || 'Post not found'}</p>
        <Link to="/home" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px', padding: '30px 0' }}>
      <article className="post-detail">
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta" style={{ marginBottom: '20px' }}>
            <span>By {post.authorName}</span>
            <span> • {new Date(post.createdAt).toLocaleDateString()}</span>
            {post.updatedAt && new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime() && (
              <span> • Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
            )}
          </div>

          {canEditPost() && (
            <div className="post-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleEditPost} className="btn-secondary" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Edit Post
              </button>
              <button onClick={handleDeletePost} className="btn-danger" style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Delete Post
              </button>
            </div>
          )}
        </header>

        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="post-image" style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '30px' }} />
        )}

        <div className="post-content" style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {post.content}
        </div>
      </article>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <Link to="/home" className="btn-primary" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          Back to Posts
        </Link>
      </div>
    </div>
  );
}

export default PostPage;