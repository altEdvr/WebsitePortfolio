import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function WritePost() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [canEditPost, setCanEditPost] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    if (!token) {
      navigate('/login');
      return;
    }

    setUserRole(role || 'user');
    setCurrentUserId(userId);

    // If postId exists, load the post for editing
    if (postId) {
      loadPostForEditing(postId, token, role, userId);
    } else {
      setIsLoading(false);
    }
  }, [navigate, postId]);

  const loadPostForEditing = async (id, token, role, userId) => {
    try {
      const response = await fetch(`http://localhost:48000/api/posts/${id}`);
      const data = await response.json();

      if (data.success && data.post) {
        const post = data.post;
        
        // Check permissions: user can only edit own posts, admin can edit any
        const canEdit = role === 'admin' || post.authorId === userId;
        
        if (!canEdit) {
          setSubmitMessage('You do not have permission to edit this post');
          setCanEditPost(false);
          setTimeout(() => navigate('/home'), 2000);
          return;
        }

        setCanEditPost(true);
        setIsEditMode(true);
        setFormData({
          title: post.title,
          content: post.content
        });
        setExistingImageUrl(post.imageUrl);
        setImagePreview(post.imageUrl);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setSubmitMessage('Error loading post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitMessage('');

      try {
        const token = localStorage.getItem('authToken');
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);

        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }

        const url = isEditMode ? `http://localhost:48000/api/posts/${postId}` : 'http://localhost:48000/api/posts';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend,
        });

        const data = await response.json();

        if (data.success) {
          const successMsg = isEditMode ? 'Post updated successfully! Redirecting...' : 'Post created successfully! Redirecting...';
          setSubmitMessage(successMsg);
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        } else {
          setSubmitMessage(data.message || 'Failed to save post. Please try again.');
        }
      } catch (error) {
        console.error('Error saving post:', error);
        setSubmitMessage('Network error. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setSubmitMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:48000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('Post deleted successfully! Redirecting...');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setSubmitMessage(data.message || 'Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container">
      <div className="write-post-form">
        <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>

        {isLoading ? (
          <div className="loading-spinner">Loading post...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter post title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="content">Content:</label>
              <textarea
                id="content"
                name="content"
                placeholder="Write your post content here..."
                value={formData.content}
                onChange={handleChange}
                rows="10"
                required
              />
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="image">Upload Image (Optional)</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Post preview" />
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (isEditMode ? 'Updating Post...' : 'Creating Post...') : (isEditMode ? 'Update Post' : 'Create Post')}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  className="btn-danger"
                  disabled={isDeleting}
                  onClick={handleDeletePost}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              )}
            </div>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
                {submitMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default WritePost;