import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import adminRoute from "./routes/admin.route";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8000;

const app = express();

// Enhanced CORS configuration for Vercel
const allowedOrigins = [
  "https://verdan-beige.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:4173", // Vite preview
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) {
      console.log("CORS: Allowing request with no origin");
      return callback(null, true);
    }

    console.log(`CORS check for origin: ${origin}`);

    if (allowedOrigins.includes(origin)) {
      console.log(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-HTTP-Method-Override",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin",
  ],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional CORS headers middleware for Vercel compatibility
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const origin = req.headers.origin;

    console.log(`Request from origin: ${origin || "No origin"}`);
    console.log(`Request method: ${req.method}`);
    console.log(`Request path: ${req.path}`);

    // Set CORS headers for all requests
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override"
    );

    // Handle preflight requests explicitly
    if (req.method === "OPTIONS") {
      console.log("Handling preflight OPTIONS request");
      res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
      return res.status(200).end();
    }

    next();
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced logging middleware
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`Origin: ${req.headers.origin || "No origin"}`);
    console.log(`User-Agent: ${req.headers["user-agent"]}`);
    console.log(
      `Authorization: ${req.headers.authorization ? "Present" : "Missing"}`
    );
    console.log(`Content-Type: ${req.headers["content-type"]}`);
    next();
  }
);

// Root endpoint for testing
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({
    message: "Verdan Backend API is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    origin: req.headers.origin || "No origin",
  });
});

// CORS test endpoint
app.get("/cors-test", (req: express.Request, res: express.Response) => {
  res.json({
    message: "CORS test successful!",
    origin: req.headers.origin || "No origin",
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

// Health check endpoint
app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/auth", AuthRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

// 404 handler for unmatched routes
app.use((req: express.Request, res: express.Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.path}`,
    path: req.path,
    method: req.method,
  });
});

mongoose
  .connect(MONGO_URI as string)
  .then(() => console.log("mongodb connected successfully"))
  .catch((err) => {
    console.log("error while connecting mongodb", err);
  });
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
