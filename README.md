# BaatCheet - Real-Time Chat Application

BaatCheet is a modern, full-stack real-time chat application that enables users to connect with friends, send messages instantly, and stay in touch. Built with cutting-edge web technologies for performance, scalability, and user experience.

## 📋 Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Data Flow & State Management](#data-flow--state-management)
- [API Endpoints](#api-endpoints)
- [Real-Time Communication](#real-time-communication)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)

## ✨ Features

- **User Authentication**: Secure sign up & login with JWT tokens
- **Real-Time Messaging**: Instant message delivery using Socket.io
- **Online Status**: See who's online in real-time
- **User Profiles**: Create and manage user profiles with avatars
- **Settings Management**: Customize user preferences
- **Image Uploads**: Cloudinary integration for image storage
- **Responsive UI**: Modern and mobile-friendly interface
- **Toast Notifications**: Real-time user feedback
- **Form Validation**: Client-side and server-side validation
- **Secure Password Handling**: bcryptjs for password encryption

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BaatCheet System                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐              ┌──────────────────────────┐
│   CLIENT (React/Vite)   │              │  SERVER (Node/Express)   │
├─────────────────────────┤              ├──────────────────────────┤
│ • Pages (5)             │  ◄────────►  │ • Controllers (2)        │
│ • Components (8)        │   HTTP/REST  │ • Routes (2)             │
│ • Store (Zustand)       │              │ • Middleware (Auth)      │
│ • Socket.io Client      │  ◄────────►  │ • Socket.io Server       │
│ • Axios Instance        │  WebSocket   │ • Models (2)             │
│ • Tailwind CSS          │              │ • Utilities & Libs       │
└─────────────────────────┘              └──────────────────────────┘
         │                                        │
         │                                        │
         └────────────────────┬───────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              ┌─────▼─────┐      ┌──────▼────────┐
              │  MongoDB   │      │  Cloudinary   │
              │ (Database) │      │  (Media CDN)  │
              └────────────┘      └───────────────┘
```

### Architecture Layers

#### 1. **Presentation Layer (Client)**
- React components for UI
- State management with Zustand
- Real-time socket connections
- Toast notifications for user feedback

#### 2. **API Layer (Server)**
- REST endpoints for CRUD operations
- WebSocket connections via Socket.io
- Request validation and middleware
- Authentication and authorization

#### 3. **Business Logic Layer**
- Controllers handling request processing
- Authentication logic
- Message processing and delivery
- User management

#### 4. **Data Layer**
- MongoDB for persistent data storage
- Cloudinary for media storage
- User sessions and tokens

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0.0 | UI framework |
| **Vite** | Latest | Build tool & dev server |
| **React Router** | 7.2.0 | Client-side routing |
| **Tailwind CSS** | 4.0.9 | Styling & responsive design |
| **Zustand** | 5.0.3 | State management |
| **Socket.io Client** | 4.8.1 | Real-time communication |
| **Axios** | 1.8.1 | HTTP client |
| **Lucide React** | 0.476.0 | Icon library |
| **React Hot Toast** | 2.5.2 | Toast notifications |
| **DaisyUI** | 5.0.0-beta.8 | UI component library |

### Backend (Server)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Express** | 4.21.2 | Web framework |
| **Socket.io** | 4.8.1 | Real-time communication |
| **MongoDB** | Via Mongoose | Database |
| **Mongoose** | 8.10.1 | ODM for MongoDB |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 3.0.2 | Password encryption |
| **Cloudinary** | 2.5.1 | Image storage & CDN |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Cookie Parser** | 1.4.7 | Cookie handling |
| **Nodemon** | 3.1.9 | Dev server auto-reload |
| **Dotenv** | 16.4.7 | Environment variables |

## 📁 Project Structure

```
BaatCheet/
├── README.md                          # Project documentation
│
├── client/                            # React Frontend
│   ├── package.json                   # Client dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── eslint.config.js               # ESLint rules
│   ├── vercel.json                    # Vercel deployment config
│   ├── index.html                     # HTML entry point
│   ├── public/                        # Static assets
│   └── src/
│       ├── main.jsx                   # React entry point
│       ├── App.jsx                    # Root component
│       ├── index.css                  # Global styles
│       │
│       ├── components/                # Reusable components
│       │   ├── Navbar.jsx             # Navigation bar
│       │   ├── ChatContainer.jsx      # Chat display area
│       │   ├── ChatHeader.jsx         # Chat top header
│       │   ├── MessageInput.jsx       # Message input field
│       │   ├── Sidebar.jsx            # User conversations list
│       │   ├── NoChatSelected.jsx     # Empty state
│       │   ├── AuthImagePattern.jsx   # Auth page background
│       │   ├── OptimizedImage.jsx     # Image optimization
│       │   └── skeleton/
│       │       ├── MessageSkeleton.jsx # Message loading skeleton
│       │       └── SidebarSkeleton.jsx # Sidebar loading skeleton
│       │
│       ├── pages/                     # Page components
│       │   ├── HomePage.jsx           # Main chat interface
│       │   ├── LoginPage.jsx          # Login form
│       │   ├── SignupPage.jsx         # Signup form
│       │   ├── ProfilePage.jsx        # User profile
│       │   └── SettingsPage.jsx       # App settings
│       │
│       ├── store/                     # State management (Zustand)
│       │   ├── useAuthStore.js        # Authentication state
│       │   └── useChatStore.js        # Chat state
│       │
│       ├── lib/                       # Utilities & configurations
│       │   ├── axios.js               # Axios instance setup
│       │   └── utils.js               # Helper functions
│       │
│       └── assets/                    # Images, fonts, etc.
│
└── server/                            # Node.js Backend
    ├── package.json                   # Server dependencies
    ├── server.js                      # Express app entry point
    │
    ├── controllers/                   # Route logic
    │   ├── auth.controller.js         # Authentication logic
    │   └── message.controller.js      # Message handling
    │
    ├── routes/                        # API endpoints
    │   ├── auth.route.js              # Auth endpoints
    │   └── message.route.js           # Message endpoints
    │
    ├── models/                        # Database schemas
    │   ├── user.schema.js             # User model
    │   └── message.schema.js          # Message model
    │
    ├── middleware/                    # Express middleware
    │   └── auth.middleware.js         # JWT verification
    │
    └── lib/                           # Utilities & services
        ├── db.js                      # MongoDB connection
        ├── socket.js                  # Socket.io setup
        ├── cloudinary.js              # Cloudinary config
        └── utils.js                   # Helper functions
```

## 🎨 Component Architecture

### Frontend Components Hierarchy

```
App
├── Navbar
├── Routes
│   ├── HomePage
│   │   ├── Sidebar
│   │   │   └── ChatList
│   │   ├── ChatContainer (or NoChatSelected)
│   │   │   ├── ChatHeader
│   │   │   └── MessageInput
│   │   │   └── Messages
│   │   │       ├── MessageSkeleton (Loading)
│   │   │       └── Message
│   │   └── AuthImagePattern
│   │
│   ├── LoginPage
│   │   └── AuthImagePattern
│   │
│   ├── SignupPage
│   │   └── AuthImagePattern
│   │
│   ├── ProfilePage
│   │   └── OptimizedImage
│   │
│   └── SettingsPage
│
└── Toaster (React Hot Toast)
```

### Component Responsibilities

| Component | Purpose | Props | State |
|-----------|---------|-------|-------|
| **Navbar** | Top navigation bar | - | - |
| **Sidebar** | User list & conversations | - | chat state |
| **ChatContainer** | Message display area | - | messages |
| **ChatHeader** | Chat info & user details | selectedUser | - |
| **MessageInput** | Input field for typing | - | local message |
| **NoChatSelected** | Empty state UI | - | - |
| **Message** | Individual message display | message | - |
| **OptimizedImage** | Cloudinary image display | src | loading |
| **AuthImagePattern** | Background for auth pages | - | - |

## 🔄 Data Flow & State Management

### State Management with Zustand

#### **useAuthStore**
```javascript
{
  authUser: User | null,
  isSigningUp: boolean,
  isLoggingIn: boolean,
  isUpdatingProfile: boolean,
  isCheckingAuth: boolean,
  
  // Actions
  signup(data) -> void,
  login(data) -> void,
  logout() -> void,
  checkAuth() -> void,
  updateProfile(data) -> void,
  connectSocket() -> void,
  disconnectSocket() -> void
}
```

#### **useChatStore**
```javascript
{
  messages: Message[],
  users: User[],
  selectedUser: User | null,
  isUsersLoading: boolean,
  isMessagesLoading: boolean,
  
  // Actions
  getUsers() -> void,
  getMessages(userId) -> void,
  sendMessage(text) -> void,
  setSelectedUser(user) -> void,
  subscribeToMessages() -> void,
  unsubscribeFromMessages() -> void
}
```

### Data Flow Diagram

```
User Action (Click, Type, Submit)
         │
         ▼
Component State Update
         │
         ▼
Zustand Store Update
         │
         ├─► Local State Update (UI re-render)
         │
         └─► Axios/Socket Request to Server
                  │
                  ▼
            Express Middleware
                  │
                  ▼
            Controller Logic
                  │
                  ▼
            Database Operation
                  │
                  ▼
            Response with Data
                  │
                  ▼
            Socket.io Broadcast (if real-time)
                  │
                  ▼
            Client receives update
                  │
                  ▼
            Store & Zustand Update
                  │
                  ▼
            Component Re-render
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/auth/logout` | User logout | ✅ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `PUT` | `/api/auth/update-profile` | Update user profile | ✅ |

### Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| `GET` | `/api/messages/users` | Get all users | ✅ |
| `GET` | `/api/messages/:userId` | Get chat with user | ✅ |
| `POST` | `/api/messages/send/:userId` | Send message | ✅ |

### Request/Response Examples

#### Sign Up
```javascript
POST /api/auth/signup
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "securePassword123",
  "profilePic": "image_url" // optional
}

Response (201):
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "profilePic": "image_url"
  }
}
```

#### Send Message
```javascript
POST /api/messages/send/:userId
{
  "text": "Hello! How are you?",
  "image": "image_url" // optional
}

Response (200):
{
  "success": true,
  "message": {
    "_id": "message_id",
    "senderId": "sender_id",
    "receiverId": "receiver_id",
    "text": "Hello! How are you?",
    "image": "image_url",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔌 Real-Time Communication

### Socket.io Events

#### Client to Server Events
| Event | Payload | Purpose |
|-------|---------|---------|
| `connection` | `{ userId }` | User connects to socket |
| `disconnect` | - | User disconnects |
| `message:send` | `{ text, image }` | Send new message |
| `typing` | `{ isTyping }` | User is typing indicator |

#### Server to Client Events
| Event | Payload | Purpose |
|-------|---------|---------|
| `getOnlineUsers` | `[userId, ...]` | List of online users |
| `newMessage` | `{ message }` | New incoming message |
| `userTyping` | `{ userId, isTyping }` | Typing indicator |
| `userJoined` | `{ userId }` | User came online |
| `userLeft` | `{ userId }` | User went offline |

### Socket.io Flow

```
Client Connection:
client → "connection" (with userId)
         ├─► Server stores socket mapping
         └─► Server broadcasts "getOnlineUsers"

Send Message:
client → "message:send"
         │
         ├─► Server saves to MongoDB
         │
         └─► Server emits to receiver
              └─► "newMessage" event

Disconnect:
client → "disconnect"
         ├─► Server removes socket mapping
         └─► Server broadcasts updated "getOnlineUsers"
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Authentication Flow                        │
└─────────────────────────────────────────────────────────────┘

SIGNUP:
User Input (email, password, name)
         │
         ▼
Client Validation
         │
         ▼
POST /api/auth/signup
         │
         ▼
Server Validation
         │
         ├─► Hash Password (bcryptjs)
         │
         ├─► Create User in MongoDB
         │
         └─► Generate JWT Token (stored in HTTP-only cookie)
                  │
                  ▼
              Return User Data
                  │
                  ▼
         Store in Zustand & Local Storage
                  │
                  ▼
         Connect Socket.io with userId
                  │
                  ▼
         Redirect to Homepage


LOGIN:
User Input (email, password)
         │
         ▼
Client Validation
         │
         ▼
POST /api/auth/login
         │
         ▼
Server Validation
         │
         ├─► Find User in MongoDB
         │
         ├─► Compare Password (bcryptjs)
         │
         └─► Generate JWT Token (HTTP-only cookie)
                  │
                  ▼
              Return User Data
                  │
                  ▼
         Store in Zustand & Local Storage
                  │
                  ▼
         Connect Socket.io with userId
                  │
                  ▼
         Redirect to Homepage


JWT VERIFICATION (Protected Routes):
Protected API Call
         │
         ▼
Include JWT from Cookies
         │
         ▼
Server auth.middleware.js
         │
         ├─► Extract Token
         │
         ├─► Verify with JWT Secret
         │
         ├─ Valid? → Proceed
         │
         └─ Invalid? → Unauthorized (401)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn** package manager
- **MongoDB** account (cloud) or local instance
- **Cloudinary** account for image uploads

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/baatcheet.git
cd baatcheet
```

2. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Install Client Dependencies**
```bash
cd ../client
npm install
```

4. **Configure Environment Variables** (see below)

5. **Start the Server** (from `/server` directory)
```bash
npm run dev
```

6. **Start the Client** (from `/client` directory in a new terminal)
```bash
npm run dev
```

7. **Open in Browser**
```
http://localhost:5173
```

## 🔧 Environment Configuration

### Server Environment Variables (`.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
CLIENT_URL=http://localhost:5173
PRODUCTION_URL=https://baat-cheet-nine.vercel.app
```

### Client Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:5000
```

## 🔄 Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique),
  fullName: String,
  password: String (hashed),
  profilePic: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  text: String,
  image: String (Cloudinary URL, optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 📦 Build & Deployment

### Client Deployment (Vercel)
```bash
cd client
npm run build
# Deploy to Vercel (vercel.json configured)
```

### Server Deployment
- Hosted on **Render** (mentioned in-app)
- Uses free tier (may need to wake up)
- MongoDB Atlas for database

## 🤝 Project Status

- ✅ Fully functional real-time chat
- ✅ User authentication system
- ✅ Profile management
- ✅ Online status tracking
- ✅ Responsive design
- 🔄 In active development

## 📝 License

This project is open source and available under the ISC License.

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
baatcheet/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── ...
│   ├── public/
│   └── ...
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Hot Toast](https://react-hot-toast.com/) 