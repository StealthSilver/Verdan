# Admin Management Guide

This guide provides comprehensive instructions for managing admin users in the Verdan application.

## Overview

The Verdan application uses a role-based access control system with two main roles:

- **admin**: Full access to all features including user management, site management, and analytics
- **user**: Limited access to assigned sites and basic features

## Admin User Schema

Admin users have the following properties:

```typescript
interface IUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  siteId?: ObjectId; // Optional for admins
  gender?: "male" | "female" | "other";
  designation: string;
  organization?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Methods to Create Admin Users

### Method 1: Using the Create Admin Script (Recommended)

#### Quick Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run the admin creation script
npm run create-admin
```

This will create a default admin user:

- **Email**: admin@verdan.com
- **Password**: admin123
- **Name**: Admin User
- **Role**: admin

#### Custom Admin Creation

For custom admin users, use the interactive script:

```bash
# Navigate to the backend directory
cd backend

# Run the interactive admin creation script
npm run create-admin:custom
```

### Method 2: Using the Manual Admin Creation Script

Create custom admin users by running the manual script:

```bash
cd backend
npm run build
node dist/scripts/createAdminManual.js
```

### Method 3: Database Direct Insert (Advanced Users)

If you have direct database access, you can insert admin users directly:

```javascript
// Example MongoDB insert
db.users.insertOne({
  name: "John Admin",
  email: "john@verdan.com",
  password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  designation: "System Administrator",
  gender: "other",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Steps to Add a New Admin

### Prerequisites

1. Ensure MongoDB is running and accessible
2. Backend application is configured with correct database connection
3. Environment variables are properly set

### Step-by-Step Process

#### Step 1: Prepare Environment

```bash
# Navigate to project root
cd /path/to/verdan

# Navigate to backend
cd backend

# Ensure environment variables are set
# Check .env file or create one with:
# MONGO_URI=mongodb://localhost:27017/verdan
# JWT_SECRET=your_jwt_secret
```

#### Step 2: Choose Creation Method

**Option A: Default Admin (Quick)**

```bash
npm run create-admin
```

**Option B: Custom Admin (Interactive)**

```bash
npm run create-admin:custom
```

**Option C: Manual Script**

```bash
node dist/scripts/createAdminManual.js
```

#### Step 3: Verify Admin Creation

After running any of the above commands, verify the admin was created by:

1. Checking the console output for success message
2. Logging into the frontend application with the provided credentials
3. Confirming admin access to restricted features

#### Step 4: Update Default Credentials (Security)

For production environments:

1. Log in with the created admin account
2. Change the default password immediately
3. Update email if necessary
4. Configure proper admin details

## Available NPM Scripts

The following scripts are available in the backend package.json:

```bash
# Create default admin user
npm run create-admin

# Create custom admin user (interactive)
npm run create-admin:custom

# Build TypeScript files
npm run build

# Start the server
npm start

# Development mode
npm run dev

# Seed database with sample data
npm run seed

# Backfill image IDs (maintenance script)
npm run backfill-image-ids
```

## Security Considerations

### Password Security

- Default passwords should be changed immediately after first login
- Use strong passwords with at least 8 characters
- Passwords are automatically hashed using bcrypt with 10 salt rounds

### Access Control

- Admin users have full system access
- Limit the number of admin users to essential personnel only
- Regularly audit admin user accounts

### Environment Security

- Keep environment variables secure
- Use different JWT secrets for different environments
- Ensure MongoDB connection strings are protected

## Troubleshooting

### Common Issues

#### 1. "Admin user already exists" Error

```bash
Error: Admin user already exists!
```

**Solution**: The admin with the specified email already exists. Either:

- Use a different email address
- Delete the existing admin from the database
- Use the existing admin credentials

#### 2. Database Connection Issues

```bash
Error: MongoNetworkError
```

**Solution**:

- Verify MongoDB is running
- Check MONGO_URI in environment variables
- Ensure database connectivity

#### 3. Permission Issues

```bash
Error: EACCES permission denied
```

**Solution**:

- Run with appropriate permissions
- Check file system permissions
- Ensure Node.js has necessary access

#### 4. Build Issues

```bash
Error: Cannot find module
```

**Solution**:

- Run `npm install` to install dependencies
- Run `npm run build` to compile TypeScript
- Check for missing dependencies

### Verification Steps

#### Check Admin in Database

```javascript
// MongoDB query to check admin users
db.users.find({ role: "admin" });
```

#### Test Admin Login

1. Start the frontend application
2. Navigate to login page
3. Use admin credentials
4. Verify access to admin features

## Best Practices

### Development Environment

- Use the default admin creation for quick setup
- Change credentials after first login
- Use test data for development

### Production Environment

- Always use custom admin credentials
- Never use default passwords
- Implement additional security measures
- Regular security audits

### Backup and Recovery

- Regular database backups
- Document admin account information securely
- Have recovery procedures in place

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Check database connectivity

For additional support, refer to the main project documentation or contact the development team.
