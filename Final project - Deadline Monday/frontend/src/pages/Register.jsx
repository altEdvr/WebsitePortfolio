import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
    dob: '',
    experience: '',
    gender: '',
    accountType: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname) newErrors.fullname = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.experience) newErrors.experience = 'Experience level is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.accountType) newErrors.accountType = 'Account Type is required';
    if (!formData.terms) newErrors.terms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitMessage('');

      try {
        const response = await fetch('http://localhost:48000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullname: formData.fullname,
            username: formData.username,
            password: formData.password,
            dob: formData.dob,
            experience: formData.experience,
            gender: formData.gender,
            accountType: formData.accountType,
            terms: formData.terms
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store authentication data for auto-login
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userRole', data.user.accountType === 'admin' ? 'admin' : 'user');
          localStorage.setItem('username', data.user.username);

          // Dispatch custom event to notify navbar change
          window.dispatchEvent(new Event('authChange'));

          setSubmitMessage('Registration successful! Redirecting to home page...');
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        } else {
          setSubmitMessage('Error registering. Please try again.');
        }
      } catch (error) {
        setSubmitMessage('Error registering. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <section>
        <div className="container">
          <h1 className="text-center">Join Me!</h1>

          <form id="registration-form" onSubmit={handleSubmit}>
            <h2>Sign In</h2>
            <p>Fill out the form below</p>

            <div className="form-group">
              <label htmlFor="fullname">Full name:</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
              {errors.fullname && <span className="error-message">{errors.fullname}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Preferred Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your preferred username"
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
                placeholder="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth:</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              {errors.dob && <span className="error-message">{errors.dob}</span>}
            </div>

            <div className="form-group">
              <label>Your Experience Level:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="beginner"
                    checked={formData.experience === 'beginner'}
                    onChange={handleChange}
                    required
                  />
                  Beginner
                </label>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="intermediate"
                    checked={formData.experience === 'intermediate'}
                    onChange={handleChange}
                  />
                  Intermediate
                </label>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="expert"
                    checked={formData.experience === 'expert'}
                    onChange={handleChange}
                  />
                  Expert
                </label>
              </div>
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </div>

            <div className="form-group">
              <label>Gender:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    required
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                  />
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                  />
                  Other
                </label>
              </div>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="accountType">Account Type:</label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="">Select Account Type</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
              {errors.accountType && <span className="error-message">{errors.accountType}</span>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="terms">
                    <span className="tick_mark"></span>
                  </label>
                </div>
                <p className="checkbox-label-text" style={{ marginTop: 0 }}>I Agree to receive updates on my Mentorship with the Artist.</p>
              </div>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
            {submitMessage && <p style={{ marginTop: '10px', color: submitMessage.includes('successful') ? 'green' : 'red' }}>{submitMessage}</p>}
          </form>

          <div className="content-section mt-3">
            <h2>Privacy & Data Protection</h2>
            <p>Your privacy is important to us. We are committed to protecting your personal data and ensuring a safe experience while engaging with our content. By registering, you agree to our data handling practices as outlined in our Privacy Policy.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;