# UniApply Backend

Node.js Backend with Express and MongoDB

## Prerequisites

- Node.js >= 18.0.0
- MongoDB => Running on Mongo Atlas Cloud

   npm run dev

## Database Configuration

The application uses MongoDB. Default configuration:
- **Host**: Mongo Atlas Cloud
- **Database**: uniapply

Update the `MONGO_URI` in `.env` if your setup is different.

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
│   ├── scripts/         # Testing scripts - .gitignore
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
