import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * QRRedirect Component
 * Handles redirects from old QR code URLs (e.g., /admin/dashboard/:siteId/:treeId)
 * to the new public tree view URL (e.g., /tree/:treeId)
 */
export default function QRRedirect() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (treeId) {
      // Redirect to the public tree view
      navigate(`/tree/${treeId}`, { replace: true });
    } else {
      // If no treeId, go to signin
      navigate("/", { replace: true });
    }
  }, [treeId, navigate]);

  // Show a simple loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
          <div
            className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: "#48845C" }}
          />
        </div>
        <p className="text-gray-600 font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
