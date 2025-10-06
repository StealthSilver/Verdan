import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
// import "@heroui/react/styles.css"; // ✅ Correct import for latest version
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
// import "@heroui/react/styles.css"
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <HeroUIProvider>
        <App />
      </HeroUIProvider>
    </AuthProvider>

  </React.StrictMode>
);
