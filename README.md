# AIT Football Auction System

A comprehensive real-time football player auction system built with Next.js, MongoDB, and WebSocket for live bidding.

## 🚀 Features

### Core Functionality
- **Real-time Auctions**: Live bidding with WebSocket support
- **User Management**: Admin, Captain, and Viewer roles
- **Team Management**: Create and manage football teams
- **Player Database**: Comprehensive player information system
- **Budget Tracking**: Real-time budget management for teams
- **Live Statistics**: Dashboard with real-time stats and analytics

### User Roles
- **Admin**: Full system control, user management, auction control
- **Captain**: Team management, bidding in auctions
- **Viewer**: Read-only access to auctions and team information

### Technical Features
- **Real-time Updates**: WebSocket integration for live auction updates
- **Responsive Design**: Mobile-first responsive UI
- **Authentication**: JWT-based secure authentication
- **Database**: MongoDB with Mongoose ODM
- **Docker Support**: Complete containerization setup

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Real-time**: WebSocket (ws library)
- **Authentication**: JWT (jsonwebtoken)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- npm or yarn
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd football-auction-app
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/football-auction
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
WS_PORT=8080
NODE_ENV=development
\`\`\`

### 4. Database Setup
\`\`\`bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed
\`\`\`

### 5. Development Server
\`\`\`bash
# Start both Next.js and WebSocket server
npm run dev:full

# Or start them separately:
npm run dev          # Next.js server (port 3000)
npm run ws-server    # WebSocket server (port 8080)
\`\`\`

### 6. Access the Application
- **Application**: http://localhost:3000
- **WebSocket**: ws://localhost:8080

## 🐳 Docker Deployment

### Development with Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### Production Deployment
\`\`\`bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
\`\`\`

## 👥 Default Users

After running the seed script, you can login with:

### Admin Account
- **Email**: admin@ait.edu
- **Password**: admin123
- **Role**: Admin (full system access)

### Captain Accounts
- **Email**: john@ait.edu
- **Password**: captain123
- **Role**: Captain (team management, bidding)

- **Email**: jane@ait.edu  
- **Password**: captain123
- **Role**: Captain

### Additional Test Users
- **Email**: mike@ait.edu
- **Password**: captain123
- **Role**: Captain

## 📱 Application Flow

### For Admins
1. Login with admin credentials
2. Navigate to **Admin Panel** → **Add Players** to populate the database
3. Go to **Auction Control** to start live auctions
4. Manage users and monitor system activity

### For Captains
1. Login with captain credentials
2. Create your team via **Team Management**
3. Join live auctions and place bids
4. Monitor your team's budget and players

### For Viewers
1. Access the application (no login required for viewing)
2. Watch live auctions in real-time
3. View team statistics and leaderboards

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `GET /api/teams/my-team` - Get user's team
- `GET /api/teams/public` - Public team leaderboard

### Auctions
- `GET /api/auction/current` - Get current active auction
- `POST /api/auction/start` - Start new auction (Admin)
- `POST /api/auction/bid` - Place a bid
- `POST /api/auction/end` - End auction (Admin)

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/players` - Add new player
- `PUT /api/admin/users/[id]/role` - Update user role

## 🎯 Key Features Explained

### Real-time Auctions
- WebSocket connection for instant updates
- Live bid notifications
- Automatic auction timers
- Real-time budget tracking

### Team Management
- Budget allocation and tracking
- Player acquisition history
- Team statistics and performance
- Captain role management

### Admin Controls
- User role management
- Player database management
- Auction control and monitoring
- System statistics and analytics

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password hashing with bcrypt
- Environment variable protection

## 📊 Database Schema

### Users
- Authentication and role management
- Profile information
- Team associations

### Teams
- Team information and budget
- Captain assignments
- Player rosters

### Players
- Comprehensive player database
- Ratings and statistics
- Auction availability status

### Auctions
- Live auction management
- Bid tracking and history
- Timer and status management

### Bids
- Bid history and tracking
- Team and player associations
- Winning bid determination

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
\`\`\`env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
WS_PORT=8080
\`\`\`

### Docker Production
\`\`\`bash
# Build production images
docker-compose build

# Start production services
docker-compose up -d

# Monitor logs
docker-compose logs -f app
\`\`\`

### Manual Deployment
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start

# Start WebSocket server
npm run ws-server
\`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure WebSocket server is running on correct port
   - Check firewall settings
   - Verify WS_PORT environment variable

2. **Database Connection Error**
   - Verify MongoDB is running
   - Check MONGODB_URI in environment variables
   - Ensure database permissions are correct

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser localStorage if needed

### Development Tips
- Use `npm run dev:full` to start both servers simultaneously
- Check browser console for WebSocket connection status
- Monitor MongoDB logs for database issues
- Use Docker logs for containerized debugging

## 📈 Performance Optimization

- WebSocket connection pooling
- Database query optimization
- Image optimization with Next.js
- Caching strategies for static data
- Lazy loading for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for AIT Football Auction System**
