import { Link } from 'react-router-dom';

function SplashPage() {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Welcome to Our Blog!</h1>
          <p>Discover amazing stories, share your thoughts, and connect with fellow writers</p>

          <div className="action-buttons">
            <Link to="/posts" className="btn-primary">
              Explore Posts
            </Link>
            <Link to="/register" className="btn-secondary">
              Join Our Community
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="text-center">What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📝 Write & Share</h3>
              <p>Create and publish your own blog posts with our easy-to-use editor</p>
            </div>
            <div className="feature-card">
              <h3>💬 Engage</h3>
              <p>Comment on posts, start discussions, and build connections</p>
            </div>
            <div className="feature-card">
              <h3>👥 Community</h3>
              <p>Join a vibrant community of writers and readers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <h2 className="text-center">Get Started Today</h2>
          <p className="text-center">
            Whether you're here to read inspiring stories or share your own journey,
            our platform welcomes everyone. Create your account and start exploring!
          </p>
          <div className="text-center">
            <Link to="/register" className="btn-primary">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SplashPage;