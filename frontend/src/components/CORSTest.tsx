import React, { useState } from "react";
import API from "../api";

const CORSTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testCORS = async () => {
    setIsLoading(true);
    setTestResult("Testing CORS...");

    try {
      // Test basic endpoint
      const response = await API.get("/cors-test");
      setTestResult(
        `✅ CORS Test Successful!\nStatus: ${
          response.status
        }\nData: ${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error: any) {
      console.error("CORS Test Error:", error);

      let errorMessage = "❌ CORS Test Failed!\n";

      if (error.code === "ERR_NETWORK") {
        errorMessage += "Error: Network Error (likely CORS issue)\n";
      } else if (error.response) {
        errorMessage += `Status: ${error.response.status}\n`;
        errorMessage += `Message: ${
          error.response.data?.message || "Unknown error"
        }\n`;
      } else if (error.message) {
        errorMessage += `Message: ${error.message}\n`;
      }

      errorMessage += `\nFull Error: ${JSON.stringify(error, null, 2)}`;
      setTestResult(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setIsLoading(true);
    setTestResult("Testing Auth endpoint...");

    try {
      // This should fail but we want to see the CORS behavior
      const response = await API.post("/auth/signin", {
        email: "test@test.com",
        password: "testpassword",
      });
      setTestResult(
        `Auth test response: ${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error: any) {
      console.error("Auth Test Error:", error);

      let errorMessage = "🔐 Auth Test (Expected to fail):\n";

      if (error.code === "ERR_NETWORK") {
        errorMessage += "❌ Network Error (CORS issue)\n";
      } else if (error.response) {
        errorMessage += `✅ Got response (CORS working): Status ${error.response.status}\n`;
        errorMessage += `Message: ${
          error.response.data?.message || "Auth failed as expected"
        }\n`;
      } else if (error.message) {
        errorMessage += `Message: ${error.message}\n`;
      }

      setTestResult(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">CORS Debug Tool</h2>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testCORS}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test CORS"}
          </button>

          <button
            onClick={testAuthEndpoint}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Auth Endpoint"}
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
            {testResult || "Click a test button to see results..."}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800">Debug Information:</h4>
          <p className="text-sm text-yellow-700">
            Frontend URL: {window.location.origin}
            <br />
            Backend URL:{" "}
            {import.meta.env.VITE_API_BASE_URL || "http://13.61.104.179:8000/"}
            <br />
            Environment: {import.meta.env.MODE}
            <br />
            Production: {import.meta.env.PROD ? "Yes" : "No"}
            <br />
            Expected Backend: http://13.61.104.179:8000/
          </p>
        </div>
      </div>
    </div>
  );
};

export default CORSTest;
