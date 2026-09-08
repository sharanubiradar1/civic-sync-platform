# CivicSync - Smart City Issue Reporting Platform

A full-stack web application for reporting and managing civic issues in smart cities.

##  Features

-  User Authentication (JWT)
-  Report Issues with Photos & Location
-  Interactive Map View
-  Analytics Dashboard
-  Upvote & Comment on Issues
-  Real-time Notifications
-  Fully Responsive Design

##  Tech Stack

**Frontend:** React.js, Leaflet, Chart.js, React Router

**Backend:** Node.js, Express.js, MongoDB, JWT, Multer

##  Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
Frontend Setup
Bash

cd frontend
npm install
cp .env.example .env
npm start
Environment Variables
Backend (.env):

text

PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicsync
JWT_SECRET=your_secret_key
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
Frontend (.env):

text

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
 Usage
Register at http://localhost:3000/register
Login and start reporting issues
View issues on map or list
Track progress on dashboard
 Project Structure
text

civic-sync-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/              # Database & configuration
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Custom middleware
│   │   ├── utils/               # Helper functions
│   │   └── server.js            # Entry point
│   │
│   ├── uploads/                 # Image storage
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── context/             # React Context
│   │   ├── utils/               # Helper functions
│   │   ├── styles/              # CSS files
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── .env.example
│
├── screenshots/                 # App screenshots
├── .gitignore
└── README.md
 Key Features
Backend
RESTful API with Express.js
MongoDB with Mongoose ODM
JWT Authentication
File Upload with Multer
Email Notifications
Geospatial Queries
Frontend
React Router for navigation
Context API for state management
Leaflet Maps integration
Chart.js for analytics
Responsive design
 Contributing
Contributions are welcome! Feel free to submit a Pull Request.

 Author
Sharanagouda Biradar
GitHub: @sharanubiradar1
