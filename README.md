# 🎉 Saathi - Your Happiness Club

**Connecting hearts, bridging communities, empowering elderly lives**

A comprehensive social well-being platform designed for senior citizens to manage their daily life, connect with friends, join community events, and stay active with intuitive voice assistance.

---

## 📖 About

**Saathi** (meaning "companion" in Hindi) is a modern web application that addresses the challenges of elderly isolation by providing tools for:

- **Health Management**: Prescription tracking, medication reminders, health schedules
- **Social Connection**: Find friends, join community events, connect with like-minded people
- **Daily Life Organization**: Smart reminders, travel planning, event management
- **Voice Assistance**: Natural language voice commands for hands-free operation
- **Real-time Communication**: Instant messaging with friends and family

---

## ✨ Features

### 🔐 Authentication & Security
- **Phone-based OTP Authentication**: Secure login without passwords
- **JWT Token-based Security**: Protected API endpoints
- **Session Management**: Persistent user sessions
- **Auto-logout**: Automatic session expiry for security

### ⏰ Smart Reminders
- **Voice Commands**: Speak to create reminders naturally
- **Scheduled Reminders**: Set specific dates and times
- **Automated Alarms**: Browser notifications with audio alerts
- **Quick Actions**: Create, delete, and manage reminders seamlessly
- **Visual Reminders**: Beautiful card-based UI with dark mode support

### 💊 Prescription Management
- **Medication Tracking**: Store medication names and dosages
- **Time Alerts**: Never miss a medication dose
- **Visual Cards**: Clean, organized prescription list
- **Quick Add**: Fast prescription entry with time selection
- **Audio Alarms**: Sound notifications for critical medications

### 📅 Community Events
- **Event Discovery**: Browse community events near you
- **Smart Filtering**: Filter by location (Delhi, Mumbai, Bangalore, etc.)
- **Date Filters**: Today, Tomorrow, This Week, Next Week, or custom dates
- **Event Registration**: Join events with one click
- **Attendee Tracking**: See how many people are attending
- **Event Creation**: Organize your own community events

### 💬 Real-time Messaging
- **Instant Messages**: Real-time chat with WebSocket technology
- **User Search**: Find and connect with other users
- **Chat History**: Persistent message storage
- **Online Status**: See who's currently active
- **Typing Indicators**: Know when someone is typing
- **Auto-connect**: Send friend requests with one swipe

### 👥 Find Friends
- **Swipe to Connect**: Tinder-style friend discovery
- **40+ Pre-loaded Profiles**: Instant access to potential friends
- **Random Hobbies & Interests**: Diverse profile customization
- **Auto-Message**: Automatic friend request messages
- **Visual Profiles**: Beautiful card-based profile display
- **Quick Actions**: Left swipe to pass, right swipe to be friends

### ✈️ Travel Planning
- **Trip Organization**: Plan journeys with friends
- **Category Filtering**: Sort trips by type (Beach, Mountain, City, etc.)
- **Join Trips**: Connect with others on trips
- **Visual Timelines**: See upcoming travel dates
- **Trip Details**: Destinations, dates, and participant information

### 🎤 Voice Commands
- **Natural Language Processing**: Speak naturally to create reminders
- **AssemblyAI Integration**: Advanced speech-to-text transcription
- **Automatic Parsing**: Extracts time, date, and task from voice
- **Instant Feedback**: Real-time transcription display
- **Multiple Languages**: Support for various languages

### 🎨 Beautiful UI/UX
- **Modern Design**: Clean, intuitive interface
- **Dark Mode**: Eye-friendly dark theme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Accessible**: Screen reader friendly
- **Gradient Cards**: Beautiful visual hierarchy
- **Smooth Animations**: Delightful micro-interactions
- **Radix UI Components**: Professionally built, accessible components

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled component primitives
- **Lucide React**: Beautiful icon library
- **Wouter**: Lightweight routing library
- **TanStack Query**: Powerful data fetching and caching
- **date-fns**: Modern date utility library

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **TypeScript**: Type-safe server development
- **MongoDB**: NoSQL database with Mongoose ODM
- **WebSocket**: Real-time bidirectional communication
- **JWT**: Secure token-based authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload handling

### APIs & Services
- **AssemblyAI**: Speech-to-text transcription
- **MongoDB Atlas**: Cloud database hosting
- **WebSocket Server**: Custom real-time messaging

### Development Tools
- **TypeScript**: Type safety across full stack
- **ESLint**: Code linting
- **Nodemon/TSX**: Auto-reload during development
- **Concurrently**: Run multiple processes simultaneously

---

## 📦 Project Structure

```
Saathi-App/
├── server/                           # Backend Server
│   ├── controllers/                  # Business logic handlers
│   │   ├── authController.ts         # Authentication logic
│   │   ├── reminderController.ts     # Reminder operations
│   │   ├── messageController.ts      # Message handling
│   │   ├── eventController.ts        # Event management
│   │   ├── tripController.ts         # Trip planning
│   │   ├── voiceController.ts        # Voice transcription
│   │   └── seedData.ts               # Database seeding
│   ├── models/                       # MongoDB schemas
│   │   ├── User.ts                   # User model
│   │   ├── Reminder.ts               # Reminder model
│   │   ├── Message.ts                # Message model
│   │   ├── Event.ts                  # Event model
│   │   ├── Trip.ts                   # Trip model
│   │   └── Prescription.ts           # Prescription model
│   ├── routes/                       # API routes
│   │   ├── auth.ts                   # Auth routes
│   │   ├── reminders.ts            # Reminder routes
│   │   ├── messages.ts               # Message routes
│   │   ├── events.ts                 # Event routes
│   │   ├── trips.ts                  # Trip routes
│   │   └── voice.ts                  # Voice routes
│   ├── middleware/                   # Middleware functions
│   │   └── auth.ts                   # JWT authentication
│   ├── data/                         # Temporary file storage
│   │   └── audio/                    # Voice recordings
│   ├── websocket.ts                  # WebSocket server
│   ├── index.ts                      # Server entry point
│   └── .env                          # Environment variables
│
├── client/                           # Frontend Application
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.tsx              # Dashboard
│   │   │   ├── RemindersPage.tsx     # Reminders list
│   │   │   ├── PrescriptionsPage.tsx # Prescriptions
│   │   │   ├── EventsPage.tsx        # Community events
│   │   │   ├── MessagesPage.tsx      # Messaging
│   │   │   ├── FindFriendsPage.tsx   # Friend discovery
│   │   │   ├── TripsPage.tsx         # Travel planning
│   │   │   └── Landing.tsx           # Login page
│   │   ├── components/               # Reusable components
│   │   │   ├── ReminderBloc.tsx      # Reminder card
│   │   │   ├── PrescriptionBloc.tsx  # Prescription card
│   │   │   ├── VoiceNavButton.tsx    # Voice input button
│   │   │   └── ui/                   # UI components
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.ts            # Authentication hook
│   │   │   ├── useWebSocket.ts       # WebSocket connection
│   │   │   ├── useReminderAlarm.ts   # Reminder notifications
│   │   │   └── usePrescriptionAlarm.ts
│   │   ├── lib/                      # Utilities
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   └── utils.ts              # General utilities
│   │   └── App.tsx                   # Main app component
│   ├── public/                       # Static assets
│   └── vite.config.ts                # Vite configuration
│
└── package.json                      # Root package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB Atlas** account (free tier available) or local MongoDB
- **AssemblyAI** API key (optional, for voice features)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Saathi-App
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `server/.env`:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
ASSEMBLYAI_API_KEY=your_assemblyai_key
```

4. **Run the application**
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 📱 How It Works

### 1. Authentication Flow
```
User enters phone → OTP sent → User verifies → JWT token issued → User logged in
```

### 2. Voice Reminder Creation
```
User clicks mic → Records audio → Uploads to server → 
Transcribes with AssemblyAI → Extracts date/time → Creates reminder → Shows notification
```

### 3. Real-time Messaging
```
User sends message → WebSocket forwards to server → 
Server saves to DB → Broadcasts to recipient → Real-time delivery
```

### 4. Friend Discovery
```
User swipes right → Auto-message sent → Connection saved → 
Appears in conversations → Can chat instantly
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create a reminder
- `DELETE /api/reminders/:id` - Delete a reminder

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create a prescription
- `DELETE /api/prescriptions/:id` - Delete a prescription

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/with/:userId` - Get messages with a user
- `POST /api/messages/send` - Send a message
- `GET /api/messages/search` - Search for users

### Events
- `GET /api/events` - Get all events (with filters)
- `POST /api/events` - Create an event
- `POST /api/events/:id/register` - Register for an event

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create a trip
- `POST /api/trips/:id/join` - Join a trip

### Voice
- `POST /api/voice/command` - Transcribe audio

---

## 🎯 Key Features Explained

### Smart Reminders
- **Voice Input**: Speak naturally like "Remind me to take medicine tomorrow at 3 PM"
- **Scheduling**: Choose specific dates and times
- **Automated Alarms**: Browser notifications with audio alerts
- **Visual Feedback**: Beautiful gradient cards

### Find Friends
- **Tinder-style Swipe**: Right swipe to be friends, left to pass
- **Random Profiles**: 40+ profiles with diverse hobbies and interests
- **Auto-Connect**: Automatically sends friend request message
- **Instant Chat**: Start chatting immediately after connecting

### Community Events
- **Location-based**: Find events in your city
- **Date Filters**: Filter by today, tomorrow, this week, etc.
- **One-click Join**: Register for events instantly
- **Attendee Count**: See how many people are participating

### Real-time Messaging
- **Instant Delivery**: WebSocket-powered real-time chat
- **Message Persistence**: All messages saved to database
- **Search Users**: Find people by name or phone
- **Typing Indicators**: See when someone is typing

---

## 🌐 Deployment

The application is designed for separate deployment of client and server.

### Server Deployment (Railway/Render)
```bash
# Root Directory: server
# Build Command: npm install
# Start Command: npm run dev
```

### Client Deployment (Vercel/Netlify)
```bash
# Root Directory: client
# Build Command: npm run build
# Output Directory: dist
```

Environment Variables:
- **Server**: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`
- **Client**: `VITE_API_URL`, `VITE_WS_URL`

---

## 👥 Team

**Saathi Development Team**

Building technology to bridge generational gaps and keep communities connected. Dedicated to making technology accessible and meaningful for senior citizens.

**Special Thanks**
- Community for feedback and testing
- Open source contributors
- Elderly care organizations

---

## 📄 License

MIT License - Feel free to use and modify for your projects.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for senior citizens everywhere**

*Saathi - Because no one should feel alone*
