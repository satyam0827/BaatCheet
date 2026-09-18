# BaatCheet

BaatCheet is a full-stack real-time chat application built with React, Express, MongoDB, Socket.IO, and Cloudinary. It supports user signup/login, profile updates, instant messaging, unread counts, online presence, and image sharing in a single chat experience.

## Features

- JWT-based authentication using HTTP-only cookies
- Secure sign up, login, logout, and profile updates
- Real-time online user tracking with Socket.IO
- Message delivery and seen-state updates
- Unread message counts in the sidebar
- Recent conversation ordering based on last activity
- Message deletion for self or for everyone
- Message forwarding between users
- Image upload support through Cloudinary
- Responsive UI for desktop and smaller screens

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM 7
- Zustand
- Socket.IO Client
- Tailwind CSS 4
- DaisyUI
- Axios
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express 4
- Socket.IO
- MongoDB with Mongoose
- JWT
- bcryptjs
- Cloudinary
- Cookie Parser
- CORS
- Dotenv

## Project Structure

```bash
BaatCheet/
├── README.md
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── vercel.json
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── AuthImagePattern.jsx
│       │   ├── ChatContainer.jsx
│       │   ├── ChatHeader.jsx
│       │   ├── MessageInput.jsx
│       │   ├── Navbar.jsx
│       │   ├── NoChatSelected.jsx
│       │   ├── OptimizedImage.jsx
│       │   ├── Sidebar.jsx
│       │   └── skeleton/
│       │       ├── MessageSkeleton.jsx
│       │       └── SidebarSkeleton.jsx
│       ├── lib/
│       │   ├── axios.js
│       │   └── utils.js
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── SettingsPage.jsx
│       │   └── SignupPage.jsx
│       └── store/
│           ├── useAuthStore.js
│           └── useChatStore.js
├── server/
│   ├── package.json
│   ├── server.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── message.controller.js
│   ├── lib/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   ├── socket.js
│   │   └── utils.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── message.schema.js
│   │   └── user.schema.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   └── message.route.js
│   └── .env
└── .gitignore
```

## Authentication and API Behavior

### Auth Routes

```http
POST /api/auth/signUp
POST /api/auth/logIn
POST /api/auth/logOut
GET /api/auth/checkAuth
PUT /api/auth/update-profile
```

### Message Routes

```http
GET /api/messages/users
GET /api/messages/:id
POST /api/messages/send/:id
DELETE /api/messages/:id
POST /api/messages/forward
```

### Auth Flow

- User signs up or logs in.
- Server validates credentials and creates a JWT.
- The token is stored in an HTTP-only cookie.
- Protected routes verify the token in `auth.middleware.js`.
- Auth state is cached in Zustand on the frontend.

### Real-Time Events

The app uses Socket.IO for the following live behaviors:

- `getOnlineUsers`: broadcasts online user IDs
- `newMessage`: pushes incoming messages to the receiver
- `messageStatusUpdated`: updates delivered/seen status on both ends
- `messageDeleted`: removes deleted messages from the chat UI
- `message:delivered`: marks a message as delivered
- `messages:seen`: marks incoming messages as seen

## Environment Variables

### Server `.env`

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client `.env`

```env
VITE_BACKEND_URL=http://localhost:3000
```

If `VITE_BACKEND_URL` is not set, the client falls back to `http://localhost:3000` in development mode and `/api` in production.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB instance or MongoDB Atlas connection string
- Cloudinary account for image uploads

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Run the project

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the app in the browser at:

```text
http://localhost:5173
```

## Build and Deployment

### Client build

```bash
cd client
npm run build
```

### Server start

```bash
cd server
npm start
```

The project is designed to work with a Vercel-hosted frontend and a Node/Express backend that can run on Render or another hosting platform.

## Notes

- The server currently allows CORS from `http://localhost:5173` and `https://baat-cheet-nine.vercel.app`.
- The backend uses cookies for authentication, so the frontend must send credentials with each request.
- The app combines REST APIs with real-time socket events for a chat experience similar to modern messaging apps.

## License

This project is currently distributed under the ISC license in the server package configuration.
