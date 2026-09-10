# 🚂 Advanced Railway Reservation System

A comprehensive, production-ready online railway reservation and ticketing system built with modern web technologies.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Features
- ✅ **User Authentication** - Secure login/registration with JWT
- ✅ **Train Search** - Search trains by route, date, and class
- ✅ **Online Booking** - Easy-to-use booking interface
- ✅ **Multiple Payment Options** - Stripe integration for secure payments
- ✅ **Ticket Generation** - PDF ticket download
- ✅ **Booking History** - View all past and upcoming bookings
- ✅ **Email Notifications** - Confirmation and status updates
- ✅ **Cancellation & Refund** - Easy cancellation with refund processing
- ✅ **Special Requests** - Add special requirements (wheelchair, meal preferences)

### Admin Features
- 🔐 **Admin Dashboard** - Comprehensive analytics and management
- 🚂 **Train Management** - Add/edit/delete trains and schedules
- 👥 **User Management** - Monitor user activities
- 📊 **Booking Analytics** - Revenue and occupancy reports
- 💰 **Payment Processing** - Track and manage payments
- 📧 **Email Management** - Send bulk notifications
- 🔧 **System Configuration** - Manage fares and policies

## 🛠 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Bootstrap 5
- **JavaScript (ES6+)** - Dynamic interactions
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcryptjs** - Password encryption
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **PDFKit** - PDF generation

### DevOps & Tools
- **Nodemon** - Development server auto-reload
- **Jest** - Testing framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
railways-reservation/
├── public/
│   ├── index.html           # Main UI
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       └── script.js        # Frontend logic
├── models/
│   ├── User.js              # User schema
│   ├── Train.js             # Train schema
│   ├── Booking.js           # Booking schema
│   └── Payment.js           # Payment schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── trains.js            # Train routes
│   ├── bookings.js          # Booking routes
│   ├── users.js             # User routes
│   └── admin.js             # Admin routes
├── middleware/
│   ├── auth.js              # JWT verification
│   └── validation.js        # Input validation
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── trainController.js   # Train logic
│   ├── bookingController.js # Booking logic
│   └── paymentController.js # Payment logic
├── services/
│   ├── emailService.js      # Email sending
│   ├── pdfService.js        # PDF generation
│   └── paymentService.js    # Payment handling
├── .env                     # Environment variables
├── package.json             # Dependencies
├── server.js                # Express server setup
└── README.md                # Documentation
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/sanjaykumar7539/Railways.git
cd Railways
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/railways
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLIC_KEY=your_stripe_public_key
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
NODE_ENV=development
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

6. **Access the application**
Open your browser and navigate to `http://localhost:5000`

## 📚 Usage

### For Users

1. **Register/Login**
   - Click "Login" in navbar
   - Create new account or sign in with existing credentials

2. **Search Trains**
   - Select departure and arrival stations
   - Choose travel date and class
   - Enter number of passengers
   - Click "Search Trains"

3. **Book Ticket**
   - Select desired train
   - Fill passenger details
   - Review fare summary
   - Proceed to payment

4. **Make Payment**
   - Enter card details (Stripe)
   - Secure payment processing
   - Receive confirmation email

5. **Download Ticket**
   - Visit "My Bookings" section
   - Download PDF ticket
   - Print or show on mobile

### For Admins

1. **Admin Login**
   - Access `/admin` with admin credentials

2. **Dashboard**
   - View real-time analytics
   - Monitor bookings and revenue

3. **Manage Trains**
   - Add new trains
   - Update schedules
   - Manage seat availability

4. **View Users**
   - Monitor user registrations
   - Track user activities

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
POST   /api/auth/logout       - User logout
POST   /api/auth/forgot-password - Password reset
```

### Train Endpoints

```
GET    /api/trains            - Search available trains
GET    /api/trains/:id        - Get train details
POST   /api/trains (Admin)    - Add new train
PUT    /api/trains/:id (Admin) - Update train
DELETE /api/trains/:id (Admin) - Delete train
```

### Booking Endpoints

```
POST   /api/bookings          - Create new booking
GET    /api/bookings          - Get user bookings
GET    /api/bookings/:id      - Get booking details
PUT    /api/bookings/:id      - Cancel booking
GET    /api/bookings/:id/ticket - Download ticket
```

### Payment Endpoints

```
POST   /api/payments          - Process payment
GET    /api/payments/:id      - Get payment details
POST   /api/payments/:id/refund - Process refund
```

### User Endpoints

```
GET    /api/users/profile     - Get user profile
PUT    /api/users/profile     - Update profile
POST   /api/users/change-password - Change password
```

## 🗄 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  gender: String,
  address: String,
  city: String,
  postalCode: String,
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Trains Collection
```javascript
{
  _id: ObjectId,
  trainNumber: String (unique),
  trainName: String,
  fromStation: String,
  toStation: String,
  departureTime: Time,
  arrivalTime: Time,
  duration: String,
  classes: {
    "1A": { seats: Number, fare: Number },
    "2A": { seats: Number, fare: Number },
    "3A": { seats: Number, fare: Number },
    "SL": { seats: Number, fare: Number }
  },
  createdAt: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  trainId: ObjectId,
  passengers: [
    {
      name: String,
      gender: String,
      age: Number
    }
  ],
  class: String,
  seatNumbers: [String],
  bookingDate: Date,
  journeyDate: Date,
  totalFare: Number,
  status: String (confirmed/cancelled),
  specialRequests: String,
  createdAt: Date
}
```

### Payments Collection
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId,
  userId: ObjectId,
  amount: Number,
  currency: String,
  paymentMethod: String,
  stripePaymentId: String,
  status: String (pending/completed/failed),
  transactionDate: Date,
  createdAt: Date
}
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Secure payment processing with Stripe
- ✅ Rate limiting
- ✅ HTTPS ready

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Email**: support@railways.in
- **Phone**: 1800-111-139
- **Website**: www.railways.in
- **GitHub Issues**: [Report Bug](https://github.com/sanjaykumar7539/Railways/issues)

## 🎯 Roadmap

- [ ] Mobile App (React Native)
- [ ] Real-time seat selection
- [ ] Group booking discounts
- [ ] Loyalty program
- [ ] Insurance options
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Analytics dashboard

## 👨‍💻 Author

**Sanjay Kumar**
- GitHub: [@sanjaykumar7539](https://github.com/sanjaykumar7539)

## 🙏 Acknowledgments

- Bootstrap team for amazing CSS framework
- Font Awesome for icons
- Stripe for payment processing
- MongoDB community

---

**Made with ❤️ for Railway Lovers** 🚂
