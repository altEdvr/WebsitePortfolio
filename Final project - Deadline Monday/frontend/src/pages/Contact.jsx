import { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:48000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitMessage(data.message || 'Error sending message. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section>
        <div className="container">
          <h1 className="text-center">Get In Touch</h1>
          <p className="text-center">I'd love to hear from you! Whether you have a question, want to collaborate on a project, or just want to connect with a fellow web development enthusiast, feel free to reach out using the form below.</p>

          <form onSubmit={handleSubmit}>
            <h2>Send Me a Message</h2>
            <div className="form-group">
              <label htmlFor="name">Your Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Your Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Message:</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell me about your project idea or question..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {submitMessage && <p style={{ marginTop: '10px', color: submitMessage.includes('successfully') ? 'green' : 'red' }}>{submitMessage}</p>}
          </form>

          <div className="content-section mt-3">
            <h1>Collab with the Artist</h1>
            <img src="/Ed.jpg" alt="Edvir" className="section-image" />
          </div>

          <div className="content-section mt-3">
            <h2>Featured Resources</h2>
            <p>Here are some of my favorite resources across different creative fields. These platforms offer excellent tutorials and support for learners at all levels.</p>

            <table>
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><a href="https://www.codecademy.com" target="_blank" rel="noopener noreferrer">Codecademy</a></td>
                  <td>Interactive coding tutorials for beginners and advanced learners. Learn programming languages like Python, JavaScript, HTML, CSS, and more with hands-on projects.</td>
                </tr>
                <tr>
                  <td><a href="https://www.udemy.com" target="_blank" rel="noopener noreferrer">Udemy</a></td>
                  <td>Online learning platform offering courses in coding tutorials, photography techniques, videography, and more from experienced instructors worldwide.</td>
                </tr>
                <tr>
                  <td><a href="https://www.adobe.com/creativecloud" target="_blank" rel="noopener noreferrer">Adobe Creative Cloud</a></td>
                  <td>Professional suite of tools for photography, videography, and digital design. Industry-standard software used by creators and professionals globally.</td>
                </tr>
                <tr>
                  <td><a href="https://www.skillshare.com" target="_blank" rel="noopener noreferrer">Skillshare</a></td>
                  <td>Creative learning platform with courses on photography, videography, coding, design, and more. Perfect for developing skills in multiple creative disciplines.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="content-section mt-3">
            <h2>Find Me Here</h2>
            <p>While this is a student portfolio project, here's a placeholder for where you might find me working on my coding projects!</p>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.95373531531654!3d-37.817209979751654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sau!4v1234567890123!5m2!1sen!2sau"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div className="content-section mt-3">
            <h2>Connect & Learn More</h2>
            <p>Check out these valuable resources to enhance your skills in coding, photography, and videography:</p>
            <ul>
              <li><a href="https://www.codecademy.com" target="_blank" rel="noopener noreferrer">Codecademy</a> - Interactive coding tutorials for all skill levels</li>
              <li><a href="https://www.adobe.com/products/photoshop" target="_blank" rel="noopener noreferrer">Adobe Photoshop</a> - Professional photography and image editing software</li>
              <li><a href="https://www.adobe.com/products/premiere" target="_blank" rel="noopener noreferrer">Adobe Premiere Pro</a> - Industry-leading videography and video editing software</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;