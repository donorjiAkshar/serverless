# Serverless Fullstack Frontend

A production-ready React frontend for the serverless fullstack application.

## Tech Stack

- React 18 (Create React App)
- react-router-dom v6
- axios
- Context API (no Redux)
- JavaScript (not TypeScript)

## Prerequisites

- Node.js 14+ installed
- Backend server running on http://localhost:3000

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3001

## Environment Variables

The app uses the following environment variables (defined in `.env`):

```
REACT_APP_API_URL=http://localhost:3000
```

## Features

- User registration and login
- Protected dashboard with authentication
- File upload to S3
- SNS notification sending
- Token-based authentication with localStorage
- Automatic token refresh and logout handling

## Architecture

```
src/
├── api/           # API service modules
├── auth/          # Authentication context and providers
├── components/    # Reusable components
├── pages/         # Page components
├── utils/         # Utility functions
├── App.js         # Main app component with routing
└── index.js       # Entry point
```

## User Flow

1. Register a new account
2. Login with credentials
3. User data is saved to DynamoDB
4. Login event is sent to Kinesis
5. Access protected dashboard with:
   - File upload to S3
   - SNS notification sender
   - Logout functionality

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /me` - Get current user profile
- `POST /users` - Save user to DynamoDB
- `POST /upload` - Upload file to S3
- `POST /notify` - Send SNS notification
- `POST /stream` - Send event to Kinesis

## Security Features

- JWT token storage in localStorage
- Automatic token attachment via axios interceptors
- Protected routes with authentication checks
- Automatic logout on token expiration
- Proper error handling and user feedback
