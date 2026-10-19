import { Navigate } from "react-router-dom";
import { hasRoleSession } from "../api/authSession";

function ProtectedRoleRoute({ role, children }) {
  return hasRoleSession(role) ? children : <Navigate to={`/${role}`} replace />;
}

export default ProtectedRoleRoute;
