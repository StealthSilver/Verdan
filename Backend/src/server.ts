import express from "express";
import mongoose from "mongoose";
// Removed cors package usage to avoid swallowing preflight without headers
import dotenv from "dotenv";
import AuthRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import adminRoute from "./routes/admin.route";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8000;

const app = express();

// Central CORS handling
const DEFAULT_FRONTEND_ORIGIN = "https://verdan-beige.vercel.app";
const allowedOrigins = new Set([
  DEFAULT_FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:4173",
  "https://verdan-beige.vercel.app",
  "https://verdanapp.vercel.app",
  // Add all your frontend domains
  "https://verdan-beige.vercel.app",
  "https://verdanapp.vercel.app",
]);

app.use((req, res, next) => {
  const originHeader = req.headers.origin;
  const normalizedOrigin = originHeader
    ? originHeader.replace(/\/$/, "")
    : undefined;
  const isAllowed = normalizedOrigin
    ? allowedOrigins.has(normalizedOrigin)
    : false;

  // Set CORS headers
  if (originHeader && isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", originHeader);
  } else {
    // For Render deployment, be more permissive but log for monitoring
    res.setHeader("Access-Control-Allow-Origin", originHeader || "*");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-HTTP-Method-Override"
  );

  // Log all origins for monitoring
  console.log(
    "[CORS] Origin:",
    originHeader,
    "| Allowed:",
    isAllowed,
    "| Method:",
    req.method,
    "| Path:",
    req.path
  );

  if (req.method === "OPTIONS") {
    console.log(
      "[CORS PREFLIGHT] method=",
      req.headers["access-control-request-method"],
      "path=",
      req.path,
      "origin=",
      originHeader
    );
    return res.status(204).end();
  }
  next();
});

// Debug route to inspect origin handling
app.get("/debug/origin", (req, res) => {
  res.json({
    receivedOrigin: req.headers.origin || null,
    allowed: req.headers.origin ? allowedOrigins.has(req.headers.origin) : null,
    list: Array.from(allowedOrigins),
  });
});

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

// When deployed on Vercel (@vercel/node) we export the app instead of listening.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`);
  });
}

export default app;
