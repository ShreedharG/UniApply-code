# UniApply Backend

Node.js Backend with Express and PostgreSQL

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (running locally on port 5432)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update database credentials if needed
   ```bash
   cp .env.example .env
   ```

3. **Create Database**
   Make sure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE uniapply;
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

## Database Configuration

The application uses PostgreSQL. Default configuration:
- **Host**: localhost
- **Port**: 5432
- **Database**: uniapply
- **User**: postgres
- **Password**: admin123

Update the `DATABASE_URL` in `.env` if your setup is different.

## Features

- ✅ User Authentication (JWT)
- ✅ Application Management
- ✅ Document Upload & Verification
- ✅ Support Tickets
- ✅ Payment Processing (Mock)
- ✅ University & Program Management

## API Documentation

See [API_TESTING.md](./API_TESTING.md) for complete API documentation and curl examples.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (not configured yet)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── server.js        # Application entry point
├── uploads/             # Uploaded files
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Notes

- The application auto-seeds the database with sample data on first run
- Cache middleware is included but runs in no-op mode (Redis can be added later)
- File uploads are stored in the `uploads/` directory
