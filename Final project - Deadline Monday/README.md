# MERN Portfolio

This is a MERN (MongoDB, Express, React, Node.js) portfolio application migrated from a static HTML/CSS/JS site.

## Project Structure

- `backend/` - Express.js server with API endpoints
- `frontend/` - React application with routing
- `public/` - Static assets (images moved here)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173` (or next available port)

## Features

- Home page with hero section and portfolio preview
- About page with interactive number guessing game
- Contact page with form and resources table
- Registration page with form validation
- Responsive design
- **Data Storage**: Form submissions are saved to MongoDB database

## Data Storage

The application now stores form data in MongoDB:

### Contact Messages
- **Endpoint**: `POST /api/contact`
- **Data Stored**: name, email, message, timestamp
- **Collection**: `contacts`

### User Registrations
- **Endpoint**: `POST /api/register`
- **Data Stored**: fullname, username, password, dob, experience, gender, accountType, terms, timestamp
- **Collection**: `registers`

### Database Connection
- **Database**: `portfolio`
- **Connection**: `mongodb://localhost:27017/portfolio`
- **Note**: Make sure MongoDB is running locally for data persistence

## Migration Notes

This application was migrated from static HTML files to a MERN stack:
- HTML pages converted to React components
- Inline JavaScript converted to React hooks and state management
- Form validation moved to React state management
- Routing handled by React Router
- Static assets moved to public directory
- Added MongoDB integration for data persistence