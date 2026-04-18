import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
    dob: '',
    experience: '',
    gender: '',
    accountType: '',
    terms: true
  });

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    fetchContacts();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
      navigate('/login');
      return;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/admin/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      } else {
        setError('Failed to fetch contacts');
      }
    } catch (error) {
      setError('Error fetching contacts');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      console.log('Deleting user:', userId, 'with token:', token);
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);
      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
        setError(''); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setContacts(contacts.filter(contact => contact._id !== contactId));
        setError(''); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to delete contact message');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Error deleting contact message');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentStatus })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, active: !currentStatus } : user
        ));
        setError('');
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (error) {
      setError('Error updating user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validate password match
    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate all required fields
    if (!newUser.fullname || !newUser.username || !newUser.password || !newUser.dob || 
        !newUser.experience || !newUser.gender || !newUser.accountType) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://portfolio-backend-soyk.onrender.com/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullname: newUser.fullname,
          username: newUser.username,
          password: newUser.password,
          dob: newUser.dob,
          experience: newUser.experience,
          gender: newUser.gender,
          accountType: newUser.accountType,
          terms: newUser.terms
        })
      });

      const data = await response.json();
      if (data.success) {
        // Reset form and update users list
        setNewUser({
          fullname: '',
          username: '',
          password: '',
          confirmPassword: '',
          dob: '',
          experience: '',
          gender: '',
          accountType: '',
          terms: true
        });
        setShowCreateForm(false);
        setError('');
        // Refresh users list
        await fetchUsers();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error creating user');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management ({users.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Messages ({contacts.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div className="admin-actions">
            <button
              className="btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New User'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="create-user-form">
              <h2>Create New User</h2>

              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={newUser.fullname}
                  onChange={(e) => setNewUser({...newUser, fullname: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={newUser.dob}
                  onChange={(e) => setNewUser({...newUser, dob: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Experience:</label>
                <select
                  value={newUser.experience}
                  onChange={(e) => setNewUser({...newUser, experience: e.target.value})}
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label>Gender:</label>
                <select
                  value={newUser.gender}
                  onChange={(e) => setNewUser({...newUser, gender: e.target.value})}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Account Type:</label>
                <select
                  value={newUser.accountType}
                  onChange={(e) => setNewUser({...newUser, accountType: e.target.value})}
                  required
                >
                  <option value="">Select Account Type</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <button type="submit" className="btn">Create User</button>
            </form>
          )}

          <h2>User Management</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Account Type</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.fullname}</td>
                    <td>{user.accountType}</td>
                    <td>{user.experience}</td>
                    <td>
                      <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${user.active ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleUserStatus(user._id, user.active)}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <>
          <h2>Contact Messages</h2>
          <div className="contacts-list">
            {contacts.length === 0 ? (
              <p className="no-contacts">No contact messages yet.</p>
            ) : (
              contacts.map(contact => (
                <div key={contact._id} className="contact-card">
                  <div className="contact-header">
                    <div className="contact-info">
                      <h3>{contact.name}</h3>
                      <p className="contact-email">{contact.email}</p>
                      <p className="contact-date">
                        {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                        {new Date(contact.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteContact(contact._id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="contact-message">
                    <p>{contact.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;