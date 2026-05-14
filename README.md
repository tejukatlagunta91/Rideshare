# RideShare

RideShare is a full-stack MERN web application developed to simplify ride booking and ride-sharing management between passengers and drivers. The platform provides secure authentication, ride creation, ride booking, dashboard management, and route visualization through a responsive and user-friendly interface.



## Features

* JWT Authentication & Role-Based Access
* Passenger, Driver & Admin Dashboards
* Ride Creation & Ride Booking
* Ride Search by Source & Destination
* Booking History Management
* Ride Request Approval/Rejection
* Route Visualization using Maps
* Ratings & Reviews System
* Chat & Communication Module
* Responsive UI Design


## Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Token)

### Version Control

* Git & GitHub



## Project Structure

```bash
RideShare/
├── client/
├── server/
├── README.md
└── .gitignore
```



## Installation & Setup

### Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```



## Modules

### Passenger Module

* Search & Book Rides
* View Booking History
* Manage Profile

### Driver Module

* Create & Manage Rides
* Approve/Reject Requests
* View Ride History

### Admin Module

* Manage Users & Rides
* Monitor Bookings
* Handle Complaints & Reports


## License

This project is developed for educational and academic purposes.

