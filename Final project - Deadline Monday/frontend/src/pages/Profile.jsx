import { useState, useEffect } from 'react';

function Profile() {
  const [user, setUser] = useState({
    fullname: '',
    username: '',
    email: '',
    dob: '',
    experience: '',
    gender: '',
    accountType: '',
    profilePicture: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage or API
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchUserProfile(userId);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      // Mock data - replace with actual API call
      const mockUser = {
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        dob: '1990-01-01',
        experience: 'Intermediate',
        gender: 'Male',
        accountType: 'user',
        profilePicture: '/Edvir.jpg' // Default profile picture
      };
      setUser(mockUser);
      setPreviewUrl(mockUser.profilePicture);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsEditing(false);
      // Mock save - replace with actual API call
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    fetchUserProfile(localStorage.getItem('userId'));
  };

  if (isLoading) {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="container">
      <div className="profile-page">
        <h1>My Profile</h1>

        <div className="profile-content">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" />
              ) : (
                <div className="default-avatar">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="upload-section">
                <label htmlFor="profilePicture" className="upload-btn">
                  Choose Photo
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <p className="upload-hint">Upload a profile picture (JPG, PNG, GIF)</p>
              </div>
            )}
          </div>

          <div className="profile-details">
            <div className="profile-actions">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleSaveProfile} className="btn-primary">
                    Save Changes
                  </button>
                  <button onClick={handleCancelEdit} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullname"
                    value={user.fullname}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{user.fullname}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Username:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={user.username}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{user.username}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Email:</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{user.email}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Date of Birth:</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={user.dob}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{new Date(user.dob).toLocaleDateString()}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Experience Level:</label>
                {isEditing ? (
                  <select name="experience" value={user.experience} onChange={handleInputChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                ) : (
                  <span>{user.experience}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Gender:</label>
                {isEditing ? (
                  <select name="gender" value={user.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <span>{user.gender}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Account Type:</label>
                <span className="account-type">{user.accountType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;