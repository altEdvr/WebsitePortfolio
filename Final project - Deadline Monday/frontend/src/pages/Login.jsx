import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitMessage('');

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store authentication data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userRole', data.user.accountType === 'admin' ? 'admin' : 'user');
          localStorage.setItem('username', data.user.username);

          // Dispatch custom event to notify navbar change
          window.dispatchEvent(new Event('authChange'));

          setSubmitMessage('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        } else {
          setSubmitMessage(data.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        setSubmitMessage('Error logging in. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container">
      <div className="login-form">
        <h1>Login to Your Account</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('successful') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}
        </form>

        <div className="auth-links">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;