import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import API from "../api";
import { getPortalOrigin } from "../utils/publicPortalUrl";

interface ConnectionStatus {
  status: "testing" | "success" | "error";
  message: string;
  timestamp?: string;
}

const ConnectionTest = () => {
  const [connection, setConnection] = useState<ConnectionStatus>({
    status: "testing",
    message: "Testing connection...",
  });

  const testConnection = async () => {
    try {
      setConnection({ status: "testing", message: "Testing connection..." });
      const response = await API.get("/");
      setConnection({
        status: "success",
        message: response.data.message || "Connected successfully!",
        timestamp: response.data.timestamp,
      });
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message ||
          "Connection failed"
        : error instanceof Error
          ? error.message
          : "Connection failed";
      setConnection({
        status: "error",
        message,
      });
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connection.status) {
      case "testing":
        return "text-yellow-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (connection.status) {
      case "testing":
        return "🔄";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-3">Backend Connection Status</h3>

      <div className={`flex items-center space-x-2 mb-3 ${getStatusColor()}`}>
        <span className="text-xl">{getStatusIcon()}</span>
        <span className="font-medium capitalize">{connection.status}</span>
      </div>

      <p className="text-gray-700 mb-3">{connection.message}</p>

      {connection.timestamp && (
        <p className="text-sm text-gray-500">
          Last checked: {new Date(connection.timestamp).toLocaleString()}
        </p>
      )}

      <button
        onClick={testConnection}
        disabled={connection.status === "testing"}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connection.status === "testing" ? "Testing..." : "Test Again"}
      </button>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <p>
          <strong>Frontend URL:</strong> {getPortalOrigin()}/
        </p>
        <p>
          <strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL}
        </p>
      </div>
    </div>
  );
};

export default ConnectionTest;
