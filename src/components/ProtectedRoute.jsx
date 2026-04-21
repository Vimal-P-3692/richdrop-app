import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  // 🔍 DEBUG (keep this)
  console.log("USER:", user);
  console.log("ROLE:", role);
  console.log("LOADING:", loading);

  // ⏳ Loading state (important)
  if (loading) {
    return (
      <div className="p-10 text-center text-lg">
        🔄 Loading...
      </div>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⚠️ Role still not loaded (VERY IMPORTANT FIX)
  if (allowedRole && !role) {
    return (
      <div className="p-10 text-center text-lg">
        🔄 Checking access...
      </div>
    );
  }

  // ❌ Role mismatch
  if (allowedRole && role !== allowedRole) {
    return (
      <div className="p-10 text-center text-xl text-red-500">
        ❌ Access Denied
      </div>
    );
  }

  // ✅ All good
  return children;
}