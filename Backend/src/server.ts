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

// Enhanced CORS configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://verdan-beige.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174", // Additional Vite port
    ];

    console.log(`CORS check for origin: ${origin}`);

    if (allowedOrigins.includes(origin)) {
      console.log(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-HTTP-Method-Override",
  ],
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Manual CORS headers as fallback
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://verdan-beige.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override"
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
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
