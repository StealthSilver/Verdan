# Serentica Renewables - Application Migration Documentation

## Project Overview

Migrating the Verdan application stack from multi-provider setup to AWS-centric infrastructure with DynamoDB and Play Store integration for React Native.

---

## Table of Contents

1. [Current vs Target Architecture](#current-vs-target-architecture)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Phase 1: Database Migration (MongoDB → DynamoDB)](#phase-1-database-migration-mongodb--dynamodb)
4. [Phase 2: Backend Migration (Render → AWS)](#phase-2-backend-migration-render--aws)
5. [Phase 3: Frontend & Landing Page (Vercel → AWS)](#phase-3-frontend--landing-page-vercel--aws)
6. [Phase 4: Email Setup (Custom Domain)](#phase-4-email-setup-custom-domain)
7. [Phase 5: React Native App Publishing](#phase-5-react-native-app-publishing)
8. [Post-Migration Validation](#post-migration-validation)
9. [Rollback Plan](#rollback-plan)

---

## Current vs Target Architecture

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER APPLICATIONS                    │
├─────────────────────────────────────────────────────────┤
│  Web Frontend       │  Landing Page    │  React Native   │
│  (Vercel)           │  (Vercel)         │  (Not Deployed) │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js/Express)              │
│                    (Render)                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                         │
│              (Third-party MongoDB Atlas)                │
└─────────────────────────────────────────────────────────┘
```

### Target Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  USER APPLICATIONS                         │
├────────────────────────────────────────────────────────────┤
│  Web Frontend          │  Landing Page     │  React Native │
│  (AWS S3 + CloudFront) │  (AWS S3 + CF)     │  (Play Store) │
└────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────┐
│         BACKEND API (Node.js/Express)                      │
│  AWS Lambda + API Gateway / or EC2 + ALB                   │
└────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────┐
│         EMAIL SERVICE                                      │
│  AWS SES (serentica.renewables@domain.com)                 │
└────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────┐
│         DATABASE (DynamoDB)                                │
│         AWS Managed NoSQL Database                         │
└────────────────────────────────────────────────────────────┘
```

---

## Pre-Migration Checklist

- [ ] **AWS Account Setup**
  - [ ] Create AWS Account or use existing
  - [ ] Set up IAM users with appropriate permissions
  - [ ] Enable billing alerts
  - [ ] Configure AWS CLI locally

- [ ] **Backups & Data Export**
  - [ ] Export full MongoDB backup
  - [ ] Export user data and configurations
  - [ ] Document all environment variables
  - [ ] Back up all API keys and secrets

- [ ] **Domain & Email Setup**
  - [ ] Verify domain ownership (serentica.renewables.com)
  - [ ] Create DNS records
  - [ ] Verify domain in AWS SES

- [ ] **Team Access**
  - [ ] Ensure all team members have AWS access
  - [ ] Share AWS credentials securely
  - [ ] Document access procedures

- [ ] **Testing Environment**
  - [ ] Set up separate AWS dev/staging environment
  - [ ] Prepare test data
  - [ ] Document rollback procedures

---

## Phase 1: Database Migration (MongoDB → DynamoDB)

### 1.1 Understanding DynamoDB vs MongoDB

| Aspect         | MongoDB         | DynamoDB                       |
| -------------- | --------------- | ------------------------------ |
| Model          | Document-based  | Key-value & Document           |
| Scalability    | Manual          | Auto-scaling                   |
| Cost           | Fixed monthly   | Pay-per-request or provisioned |
| Query Language | Complex queries | Limited query options          |
| Transactions   | Multi-document  | Limited                        |

### 1.2 Designing DynamoDB Tables

#### Table 1: Users Table

```
TableName: users
Primary Key: userId (HASH), sortKey: email (RANGE)
Attributes:
  - userId: String
  - email: String (unique)
  - name: String
  - role: String (enum: 'user', 'admin')
  - password: String (hashed)
  - avatar: String (URL)
  - createdAt: Number (timestamp)
  - updatedAt: Number (timestamp)
  - status: String (active, inactive)
  - phoneNumber: String
  - address: String

Global Secondary Indexes:
  - emailIndex: email (HASH) -> queryable by email
  - roleIndex: role (HASH) -> queryable by role
```

#### Table 2: Sites Table

```
TableName: sites
Primary Key: siteId (HASH), sortKey: timestamp (RANGE)
Attributes:
  - siteId: String
  - name: String
  - address: String
  - coordinates: Map {lat: Number, lng: Number}
  - status: String (active, inactive)
  - adminId: String (HASH in GSI)
  - teamMembers: List of Strings
  - createdAt: Number (timestamp)
  - updatedAt: Number (timestamp)
  - description: String

Global Secondary Indexes:
  - adminIdIndex: adminId (HASH) -> queryable by admin
  - statusIndex: status (HASH) -> queryable by status
```

#### Table 3: Trees Table

```
TableName: trees
Primary Key: treeId (HASH), sortKey: siteId (RANGE)
Attributes:
  - treeId: String
  - siteId: String (included in key for LSI)
  - treeName: String
  - treeType: String
  - coordinates: Map {lat: Number, lng: Number}
  - datePlanted: Number (timestamp)
  - timestamp: Number (creation timestamp)
  - status: String (healthy, diseased, dead)
  - remarks: String
  - verified: Boolean
  - plantedBy: Map {_id: String, name: String, email: String}
  - images: List of Map {url: String, timestamp: Number}

Global Secondary Indexes:
  - siteIdIndex: siteId (HASH), datePlanted (RANGE)
  - verifiedIndex: verified (HASH), datePlanted (RANGE)
```

#### Table 4: Tree Records Table

```
TableName: treeRecords
Primary Key: recordId (HASH), sortKey: treeId (RANGE)
Attributes:
  - recordId: String
  - treeId: String
  - siteId: String
  - height: Number
  - diameter: Number
  - healthStatus: String
  - observations: String
  - recordedBy: Map {_id: String, name: String}
  - recordedAt: Number (timestamp)
  - images: List of Map {url: String, timestamp: Number}

Global Secondary Indexes:
  - treeIdIndex: treeId (HASH), recordedAt (RANGE)
  - siteIdIndex: siteId (HASH), recordedAt (RANGE)
```

### 1.3 Data Migration Steps

#### Step 1: Export MongoDB Data

```bash
# Export MongoDB collections
mongoexport --uri "mongodb+srv://username:password@cluster.mongodb.net/verdan" \
  --collection users --out users.json

mongoexport --uri "mongodb+srv://username:password@cluster.mongodb.net/verdan" \
  --collection sites --out sites.json

mongoexport --uri "mongodb+srv://username:password@cluster.mongodb.net/verdan" \
  --collection trees --out trees.json

mongoexport --uri "mongodb+srv://username:password@cluster.mongodb.net/verdan" \
  --collection treeRecords --out treeRecords.json
```

#### Step 2: Create DynamoDB Tables

Using AWS CLI:

```bash
# Create Users table
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=email,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=emailIndex,Keys=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
  --region us-east-1

# Create Sites table
aws dynamodb create-table \
  --table-name sites \
  --attribute-definitions \
    AttributeName=siteId,AttributeType=S \
    AttributeName=adminId,AttributeType=S \
  --key-schema \
    AttributeName=siteId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=adminIdIndex,Keys=[{AttributeName=adminId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
  --region us-east-1

# Create Trees table
aws dynamodb create-table \
  --table-name trees \
  --attribute-definitions \
    AttributeName=treeId,AttributeType=S \
    AttributeName=siteId,AttributeType=S \
  --key-schema \
    AttributeName=treeId,KeyType=HASH \
    AttributeName=siteId,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=siteIdIndex,Keys=[{AttributeName=siteId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
  --region us-east-1

# Create Tree Records table
aws dynamodb create-table \
  --table-name treeRecords \
  --attribute-definitions \
    AttributeName=recordId,AttributeType=S \
    AttributeName=treeId,AttributeType=S \
  --key-schema \
    AttributeName=recordId,KeyType=HASH \
    AttributeName=treeId,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=treeIdIndex,Keys=[{AttributeName=treeId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
  --region us-east-1
```

#### Step 3: Data Transformation & Upload

Create a Node.js migration script:

```javascript
// migration-script.js
const AWS = require("aws-sdk");
const fs = require("fs");

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

async function migrateUsers() {
  const data = JSON.parse(fs.readFileSync("./users.json", "utf8"));

  for (const user of data) {
    const params = {
      TableName: "users",
      Item: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        password: user.password,
        createdAt: new Date(user.createdAt).getTime(),
        updatedAt: new Date(user.updatedAt).getTime(),
        status: user.status || "active",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      },
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`Migrated user: ${user.email}`);
    } catch (err) {
      console.error(`Error migrating user ${user.email}:`, err);
    }
  }
}

async function migrateSites() {
  const data = JSON.parse(fs.readFileSync("./sites.json", "utf8"));

  for (const site of data) {
    const params = {
      TableName: "sites",
      Item: {
        siteId: site._id.toString(),
        name: site.name,
        address: site.address,
        coordinates: site.coordinates,
        status: site.status,
        adminId: site.admin.toString(),
        teamMembers: site.teamMembers.map((m) => m.toString()),
        createdAt: new Date(site.createdAt).getTime(),
        updatedAt: new Date(site.updatedAt).getTime(),
      },
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`Migrated site: ${site.name}`);
    } catch (err) {
      console.error(`Error migrating site ${site.name}:`, err);
    }
  }
}

// Similar for trees and treeRecords

async function main() {
  console.log("Starting migration...");
  await migrateUsers();
  await migrateSites();
  // await migrateTrees();
  // await migrateTreeRecords();
  console.log("Migration completed!");
}

main().catch(console.error);
```

Run migration:

```bash
npm install aws-sdk
node migration-script.js
```

#### Step 4: Verify Data Migration

```bash
# Count items in each table
aws dynamodb scan --table-name users --select COUNT --region us-east-1
aws dynamodb scan --table-name sites --select COUNT --region us-east-1
aws dynamodb scan --table-name trees --select COUNT --region us-east-1
aws dynamodb scan --table-name treeRecords --select COUNT --region us-east-1
```

### 1.4 Update Backend Code for DynamoDB

#### Install DynamoDB package:

```bash
cd backend
npm install aws-sdk
```

#### Create DynamoDB connection file (`src/config/dynamodb.ts`):

```typescript
import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export default dynamodb;
```

#### Example: Update User Model

```typescript
// src/models/user.model.ts (DynamoDB version)
import dynamodb from "../config/dynamodb";
import { v4 as uuidv4 } from "uuid";

export class User {
  static async findById(userId: string) {
    const params = {
      TableName: "users",
      Key: { userId },
    };

    try {
      const result = await dynamodb.get(params).promise();
      return result.Item || null;
    } catch (err) {
      console.error("Error finding user:", err);
      throw err;
    }
  }

  static async findByEmail(email: string) {
    const params = {
      TableName: "users",
      IndexName: "emailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items?.[0] || null;
    } catch (err) {
      console.error("Error finding user by email:", err);
      throw err;
    }
  }

  static async create(userData: any) {
    const userId = uuidv4();
    const params = {
      TableName: "users",
      Item: {
        userId,
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role || "user",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "active",
      },
    };

    try {
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  }

  static async update(userId: string, updateData: any) {
    const updateExpressions = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (key !== "userId" && key !== "email") {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    }

    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = Date.now();
    expressionAttributeNames["#updatedAt"] = "updatedAt";

    const params = {
      TableName: "users",
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  }

  static async delete(userId: string) {
    const params = {
      TableName: "users",
      Key: { userId },
    };

    try {
      await dynamodb.delete(params).promise();
      return true;
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  }
}
```

---

## Phase 2: Backend Migration (Render → AWS)

### 2.1 Choose Backend Hosting Option

#### Option A: AWS Lambda (Recommended for Scalability)

- **Pros**: Auto-scales, pay-per-use, minimal ops
- **Cons**: Cold starts, 15-min timeout limit
- **Cost**: ~$0.20 per million requests

#### Option B: EC2 + Application Load Balancer

- **Pros**: Full control, consistent performance
- **Cons**: Manual scaling, fixed costs
- **Cost**: ~$20-50/month for t3.micro instance

**Recommended**: Option B (EC2) for consistency with traditional Node.js apps

### 2.2 Prepare Backend Code for AWS

#### Step 1: Create AWS IAM Role for Backend

```bash
# Create role for EC2 or Lambda
aws iam create-role \
  --role-name verdan-backend-role \
  --assume-role-policy-document file://trust-policy.json

# trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}

# Attach DynamoDB policy
aws iam attach-role-policy \
  --role-name verdan-backend-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Attach SES policy
aws iam attach-role-policy \
  --role-name verdan-backend-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
```

#### Step 2: Update Environment Variables

Create `.env.production`:

```
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<YOUR_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET>

# Database
DB_TYPE=dynamodb
DYNAMODB_REGION=us-east-1

# Email
EMAIL_SERVICE=SES
SES_REGION=us-east-1
SENDER_EMAIL=noreply@serentica.renewables.com

# API
API_URL=https://api.serentica.renewables.com
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=<GENERATE_RANDOM_KEY>
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=https://serentica.renewables.com,https://app.serentica.renewables.com

# Frontend URLs
FRONTEND_URL=https://app.serentica.renewables.com
LANDING_URL=https://serentica.renewables.com
```

#### Step 3: Update Controllers for DynamoDB

Example: Update user controller to use DynamoDB

```typescript
// src/controllers/user.controller.ts (partial update)
import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "User created successfully",
      user: { userId: user.userId, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
```

#### Step 4: Set Up Docker for Backend

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `.dockerignore`:

```
node_modules
npm-debug.log
.git
.env.local
dist
```

Build and test locally:

```bash
docker build -t verdan-backend:latest .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  -e JWT_SECRET=test-secret \
  verdan-backend:latest
```

### 2.3 Deploy Backend to EC2

#### Step 1: Launch EC2 Instance

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name verdan-key \
  --security-groups verdan-backend-sg \
  --region us-east-1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=verdan-backend}]'
```

#### Step 2: Configure Security Group

```bash
# Allow SSH
aws ec2 authorize-security-group-ingress \
  --group-name verdan-backend-sg \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-name verdan-backend-sg \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# Allow HTTPS
aws ec2 authorize-security-group-ingress \
  --group-name verdan-backend-sg \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

#### Step 3: Connect and Deploy

```bash
# SSH into instance
ssh -i verdan-key.pem ec2-user@<PUBLIC_IP>

# Update system
sudo yum update -y
sudo yum install -y nodejs npm git

# Clone repository
git clone https://github.com/your-repo/verdan.git
cd verdan/backend

# Install dependencies
npm install

# Create .env file
cat > .env.production << EOF
AWS_REGION=us-east-1
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)
# ... other env vars
EOF

# Build project
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start dist/server.js --name verdan-api --env production

# Save PM2 config
pm2 save
pm2 startup
```

#### Step 4: Set Up Nginx Reverse Proxy

```bash
sudo yum install -y nginx

# Create nginx config
sudo tee /etc/nginx/conf.d/verdan.conf > /dev/null <<EOF
upstream verdan_backend {
  server localhost:3000;
}

server {
  listen 80;
  server_name api.serentica.renewables.com;

  location / {
    proxy_pass http://verdan_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOF

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### Step 5: Set Up SSL with Let's Encrypt

```bash
sudo yum install -y certbot python-certbot-nginx

sudo certbot certonly --nginx -d api.serentica.renewables.com
```

---

## Phase 3: Frontend & Landing Page (Vercel → AWS)

### 3.1 Prepare Frontend for AWS

#### Step 1: Build Process

```bash
# In frontend directory
cd frontend
npm run build

# Output will be in dist/
ls -la dist/
```

#### Step 2: Optimize for S3/CloudFront

Update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false, // Disable for production
    minify: "terser",
  },
});
```

### 3.2 Deploy Frontend to AWS S3 + CloudFront

#### Step 1: Create S3 Buckets

```bash
# Frontend bucket
aws s3 mb s3://app.serentica.renewables.com --region us-east-1

# Landing page bucket
aws s3 mb s3://serentica.renewables.com --region us-east-1

# Enable versioning for both
aws s3api put-bucket-versioning \
  --bucket app.serentica.renewables.com \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-versioning \
  --bucket serentica.renewables.com \
  --versioning-configuration Status=Enabled
```

#### Step 2: Configure S3 for Website Hosting

```bash
# Frontend bucket policy
aws s3api put-bucket-policy \
  --bucket app.serentica.renewables.com \
  --policy file://frontend-bucket-policy.json

# frontend-bucket-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::app.serentica.renewables.com/*"
    }
  ]
}

# Apply same to landing page bucket
```

#### Step 3: Create CloudFront Distribution for Frontend

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://frontend-cf-config.json
```

`frontend-cf-config.json`:

```json
{
  "CallerReference": "frontend-dist-$(date +%s)",
  "Comment": "Serentica Renewables Frontend Distribution",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "app-s3-origin",
        "DomainName": "app.serentica.renewables.com.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/ABCDEFG"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    },
    "CachedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "TargetOriginId": "app-s3-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "all"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 3600,
    "MaxTTL": 86400
  },
  "DefaultRootObject": "index.html",
  "ErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponseCode": "200",
        "ResponsePagePath": "/index.html",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["app.serentica.renewables.com"]
  },
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": false,
    "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/XXXXX",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

#### Step 4: Upload Frontend to S3

```bash
cd frontend

# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://app.serentica.renewables.com/ \
  --delete \
  --cache-control "public, max-age=3600" \
  --exclude "index.html" \
  --exclude ".map"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://app.serentica.renewables.com/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id XXXXX \
  --paths "/*"
```

#### Step 5: Deploy Landing Page (Same Process)

```bash
cd landing

npm run build

aws s3 sync .next/static/ s3://serentica.renewables.com/_next/static/ \
  --cache-control "public, max-age=31536000" \
  --recursive

aws s3 sync .next/public/ s3://serentica.renewables.com/ \
  --cache-control "public, max-age=3600" \
  --recursive

aws s3 cp out/index.html s3://serentica.renewables.com/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"
```

### 3.3 Configure Custom Domains with Route53

#### Step 1: Create Hosted Zone (if not exists)

```bash
aws route53 create-hosted-zone \
  --name serentica.renewables.com \
  --caller-reference $(date +%s)
```

#### Step 2: Add DNS Records

```bash
# Create alias record for app frontend
aws route53 change-resource-record-sets \
  --hosted-zone-id XXXXX \
  --change-batch file://app-dns-config.json

# app-dns-config.json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.serentica.renewables.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d111111abcdef8.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}

# Create alias record for landing page
aws route53 change-resource-record-sets \
  --hosted-zone-id XXXXX \
  --change-batch file://landing-dns-config.json
```

---

## Phase 4: Email Setup (Custom Domain)

### 4.1 Verify Domain in AWS SES

#### Step 1: Verify Domain

```bash
aws ses verify-domain-identity \
  --domain serentica.renewables.com \
  --region us-east-1
```

#### Step 2: Add DKIM Records

```bash
# Get DKIM tokens
aws ses verify-domain-dkim \
  --domain serentica.renewables.com \
  --region us-east-1

# Response will show 3 CNAME records to add to Route53
```

Add these CNAME records to Route53:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id XXXXX \
  --change-batch file://ses-dkim-config.json
```

### 4.2 Create Email Templates

#### Step 1: Create SES Email Template

```bash
aws ses create-template \
  --template file://email-template.json \
  --region us-east-1
```

`email-template.json`:

```json
{
  "TemplateName": "AccessRequestConfirmation",
  "SubjectPart": "Access Request Received - Serentica Renewables",
  "TextPart": "Dear {{name}},\n\nThank you for requesting access to our Verdan platform. We have received your request and will review it shortly.\n\nRequest Details:\nEmail: {{email}}\nOrganization: {{organization}}\n\nBest regards,\nSerentica Renewables Team",
  "HtmlPart": "<html><head></head><body><h2>Access Request Received</h2><p>Dear {{name}},</p><p>Thank you for requesting access to our Verdan platform. We have received your request and will review it shortly.</p><p><strong>Request Details:</strong></p><ul><li>Email: {{email}}</li><li>Organization: {{organization}}</li></ul><p>Best regards,<br/>Serentica Renewables Team</p></body></html>"
}
```

#### Step 2: Update Backend to Send Emails via SES

Create email utility (`src/utils/email.util.ts`):

```typescript
import AWS from "aws-sdk";

const ses = new AWS.SES({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

interface EmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: {
    name: string;
    variables: Record<string, string>;
  };
}

export async function sendEmail(params: EmailParams): Promise<string> {
  try {
    if (params.template) {
      // Send templated email
      const ses_params = {
        Source: process.env.SENDER_EMAIL || "noreply@serentica.renewables.com",
        Destination: {
          ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
        },
        Template: params.template.name,
        TemplateData: JSON.stringify(params.template.variables),
      };

      const result = await ses.sendTemplatedEmail(ses_params).promise();
      return result.MessageId;
    } else {
      // Send regular email
      const ses_params = {
        Source: process.env.SENDER_EMAIL || "noreply@serentica.renewables.com",
        Destination: {
          ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
        },
        Message: {
          Subject: {
            Data: params.subject,
          },
          Body: {
            Html: {
              Data: params.html || "",
            },
            Text: {
              Data: params.text || "",
            },
          },
        },
      };

      const result = await ses.sendEmail(ses_params).promise();
      return result.MessageId;
    }
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

export async function sendAccessRequestConfirmation(
  email: string,
  name: string,
  organization: string,
): Promise<string> {
  return sendEmail({
    to: email,
    template: {
      name: "AccessRequestConfirmation",
      variables: {
        name,
        email,
        organization,
      },
    },
  });
}
```

#### Step 3: Request Production Access

By default, SES is in sandbox mode. Request production access:

```bash
aws ses get-account-sending-enabled --region us-east-1

# If false, request production access via AWS Console:
# SES > Email Addresses > click domain > Request Production Access
```

---

## Phase 5: React Native App Publishing

### 5.1 Prerequisites

- [Android Studio](https://developer.android.com/studio) installed
- [Google Play Developer Account](https://play.google.com/console) ($25 one-time fee)
- Android SDK configured
- Keystore file for signing

### 5.2 Prepare React Native App

#### Step 1: Update API Endpoints

Update `src/api.ts`:

```typescript
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://api.serentica.renewables.com";

export default axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

#### Step 2: Update App Configuration

Update `app.json`:

```json
{
  "expo": {
    "name": "Serentica Renewables",
    "slug": "serentica-renewables",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.serentica.renewables",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### 5.3 Generate Signing Key

#### Step 1: Create Keystore

```bash
keytool -genkey -v -keystore serentica-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias serentica-key \
  -storepass serentica123 \
  -keypass serentica123 \
  -dname "CN=Serentica Renewables, O=Serentica, C=IN"

# Save keystore securely and note the password
```

#### Step 2: Build APK

```bash
# Build for production
eas build --platform android --non-interactive

# Or using React Native CLI
cd android
./gradlew clean bundleRelease
```

### 5.4 Create Google Play Store Listing

#### Step 1: Create Play Store Account

- Go to [Google Play Console](https://play.google.com/console)
- Sign in with Google account
- Accept developer agreement
- Pay $25 registration fee

#### Step 2: Create New App

1. Click "Create app"
2. Enter app name: "Serentica Renewables"
3. Select category: Lifestyle
4. Fill required details

#### Step 3: Prepare Store Listing

- App name: Serentica Renewables
- Short description: Tree management and environmental monitoring platform
- Full description:

  ```
  Serentica Renewables Verdan Platform

  Efficiently manage and monitor trees across multiple sites with our comprehensive mobile application.

  Features:
  - Real-time tree health monitoring
  - Environmental data tracking
  - Multi-site management
  - Team collaboration tools
  - Secure data backup

  Join us in creating a greener future.
  ```

- Category: Lifestyle
- Content rating: Unrated
- Privacy policy: https://serentica.renewables.com/privacy-policy

#### Step 4: Add App Screenshots

Prepare screenshots (1080x1920 px):

- Home screen
- Tree details view
- Analytics dashboard
- Site management
- User profile

#### Step 5: Set Up Release

1. Go to Release > Internal Testing
2. Click "Create new release"
3. Upload APK/AAB file
4. Add release notes
5. Review and submit

### 5.5 Publishing Process

#### Step 1: Internal Testing

```bash
# Invite testers
# Go to Testers > Manage testers > Add email addresses

# Share test link from Google Play Console
```

#### Step 2: Staged Rollout

1. Go to Release > Production
2. Create new release with APK
3. Start with 5% rollout
4. Monitor crash reports for 24 hours
5. Gradually increase to 100%

#### Step 3: Full Launch

```bash
# Complete checklist:
- [ ] Content rating filled
- [ ] Privacy policy URL set
- [ ] Screenshots added
- [ ] Release notes written
- [ ] APK tested
- [ ] All permissions justified
- [ ] Terms of service available
```

### 5.6 Post-Launch Monitoring

```bash
# Monitor crashes and ratings
aws cloudwatch get-metric-statistics \
  --namespace PlayStore \
  --metric-name InstallCount \
  --start-time 2024-02-01T00:00:00Z \
  --end-time 2024-02-25T23:59:59Z \
  --period 86400
```

---

## Post-Migration Validation

### Checklist

- [ ] **Database**
  - [ ] All users migrated successfully
  - [ ] All sites and trees accessible
  - [ ] Tree records complete
  - [ ] Auto-scaling policies configured
  - [ ] Backups configured

- [ ] **Backend API**
  - [ ] All endpoints working
  - [ ] Authentication working
  - [ ] Database queries optimized
  - [ ] Error handling functional
  - [ ] Logging configured
  - [ ] Performance metrics baseline established

- [ ] **Frontend**
  - [ ] Application loads correctly
  - [ ] All features functional
  - [ ] API calls working
  - [ ] Authentication flow working
  - [ ] Performance metrics < 3s load time
  - [ ] Mobile responsive

- [ ] **Landing Page**
  - [ ] All pages loading
  - [ ] Forms functional
  - [ ] Contact information correct
  - [ ] Links working
  - [ ] SEO tags set

- [ ] **Email**
  - [ ] Welcome emails sending
  - [ ] Access request notifications working
  - [ ] Transactional emails functional
  - [ ] Sender reputation good
  - [ ] SPF/DKIM/DMARC records verified

- [ ] **React Native App**
  - [ ] App installs from Play Store
  - [ ] Login works
  - [ ] Data syncing functional
  - [ ] No crashes reported
  - [ ] App store listing complete

### Performance Benchmarks

```
Frontend:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

Backend:
- API Response Time: < 500ms (p95)
- Database Query Time: < 100ms (p95)
- Error Rate: < 0.1%
- Availability: > 99.9%

React Native:
- App Launch Time: < 3s
- Login Response: < 2s
- Tree Data Load: < 1.5s
```

---

## Rollback Plan

### If Migration Fails

#### Option 1: Quick Rollback (First 24 hours)

```bash
# Point DNS back to Vercel
aws route53 change-resource-record-sets \
  --hosted-zone-id XXXXX \
  --change-batch file://rollback-dns.json

# Rollback database to MongoDB backup
mongorestore --archive=backup.archive
```

#### Option 2: Parallel Run (Recommended)

- Keep both systems running for 2 weeks
- Route traffic gradually to new system
- Monitor all metrics
- Fall back if critical issues

#### Option 3: Data Sync

```bash
# If issues found, sync DynamoDB back to MongoDB
# Use AWS DMS (Database Migration Service) in reverse
aws dms create-replication-task \
  --replication-task-identifier dynamodb-to-mongo \
  --source-endpoint-arn arn:aws:dms:us-east-1:xxx:endpoint/dynamodb \
  --target-endpoint-arn arn:aws:dms:us-east-1:xxx:endpoint/mongodb
```

---

## Cost Estimation

### Monthly Costs (Estimated)

| Service        | Component               | Est. Cost       |
| -------------- | ----------------------- | --------------- |
| **Compute**    |                         |                 |
|                | EC2 (t3.micro)          | $8/month        |
|                | Data Transfer           | $5/month        |
| **Database**   |                         |                 |
|                | DynamoDB (10 GB)        | $50/month       |
|                | DynamoDB Backups        | $10/month       |
| **Storage**    |                         |                 |
|                | S3 (Frontend + Backups) | $15/month       |
|                | CloudFront (50 GB)      | $30/month       |
| **Email**      |                         |                 |
|                | SES (10k emails)        | $1/month        |
| **Monitoring** |                         |                 |
|                | CloudWatch Logs         | $10/month       |
|                | Route53                 | $1/month        |
| **Other**      |                         |                 |
|                | Backups & Misc          | $20/month       |
|                | **TOTAL**               | **~$150/month** |

---

## Support & Troubleshooting

### Common Issues

#### 1. CloudFront Cache Issues

```bash
# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id XXXXX \
  --paths "/*"
```

#### 2. DynamoDB Throttling

```bash
# Check throttled requests
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=users \
  --start-time 2024-02-01T00:00:00Z \
  --end-time 2024-02-25T23:59:59Z \
  --period 300 \
  --statistics Sum
```

#### 3. SES Email Not Sending

```bash
# Check bounce/complaint rates
aws ses get-account-sending-enabled
aws ses get-send-statistics
```

---

## Deployment Timeline

| Phase                | Duration     | Risk   |
| -------------------- | ------------ | ------ |
| Database Migration   | 2-3 days     | Medium |
| Backend Deployment   | 2-3 days     | Medium |
| Frontend Deployment  | 1-2 days     | Low    |
| Email Setup          | 1 day        | Low    |
| React Native Release | 3-5 days     | Low    |
| Testing & Validation | 2-3 days     | Medium |
| Full Launch          | 1 day        | Low    |
| **Total**            | **~2 weeks** |        |

---

## Contact & Support

For questions during migration:

- AWS Support: https://console.aws.amazon.com/support
- Documentation: https://aws.amazon.com/documentation
- Technical Contact: [Your Email]
- Escalation: [Manager Email]

---

**Document Version**: 1.0
**Last Updated**: February 25, 2024
**Next Review**: March 25, 2024

---

## Sign-Off

Client Name: Serentica Renewables
Date: ********\_********
Approved By: ********\_********
