import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [newImage, setNewImage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (!token) {
      navigate('/login');
      return;
    }

    setIsAuthenticated(true);
    setUserRole(role || 'user');
    setCurrentUserId(userId);

    // Fetch post data
    fetchPost(postId);
  }, [postId, navigate]);

  const fetchPost = async (id) => {
    try {
      // Mock data - replace with actual API call
      const mockPost = {
        id: id,
        title: 'Sample Blog Post',
        content: 'This is the full content of the blog post. It contains detailed information about the topic.',
        authorId: '1',
        imageUrl: '/Edvir.jpg'
      };

      // Check if user can edit this post
      if (mockPost.authorId !== currentUserId && userRole !== 'admin') {
        alert('You do not have permission to edit this post');
        navigate('/');
        return;
      }

      setPost(mockPost);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPost(prev => ({
          ...prev,
          imageUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Mock update - replace with actual API call
      const updatedPost = {
        ...post,
        // In a real app, you'd upload the image and get the URL back
        imageUrl: newImage ? post.imageUrl : post.imageUrl
      };

      console.log('Updating post:', updatedPost);
      alert('Post updated successfully!');
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };

  const canReplaceImage = () => {
    return userRole === 'admin';
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="edit-post-form">
        <h1>Edit Post</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={post.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={post.content}
              onChange={handleInputChange}
              rows="10"
              required
            />
          </div>

          {canReplaceImage() && (
            <div className="form-group">
              <label htmlFor="image">Replace Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {post.imageUrl && (
                <div className="image-preview">
                  <img src={post.imageUrl} alt="Post preview" />
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Update Post
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${postId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;