import { useNavigate } from "react-router-dom";
import "./RolePage.css";

function RolePage({ children }) {
  const navigate = useNavigate();

  return (
    <>
      <button
        className="portal-back-button role-page-back-btn"
        type="button"
        onClick={() => navigate("/role")}
        aria-label="Back to role selection"
      >
        <span aria-hidden="true">←</span>
        <span>Back</span>
      </button>
      {children}
    </>
  );
}

export default RolePage;
