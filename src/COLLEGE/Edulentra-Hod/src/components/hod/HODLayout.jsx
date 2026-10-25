import { useLocation } from "react-router-dom";
import HODSidebar from "./HODSidebar";
import HODHeader from "./HODHeader";
import PortalBackButton from "../../../../PortalBackButton";
import "../../styles/hod/HODLayout.css";

function HODLayout({ children }) {
  const location = useLocation();
  const fallbackTo =
    location.pathname === "/hod/dashboard" ? "/hod" : "/hod/dashboard";

  return (
    <div className="hod-layout">

      {/* Sidebar */}
      <HODSidebar />

      {/* Main Area */}
      <div className="hod-main">

        {/* Header */}
        <HODHeader />

        {/* Page Content */}
        <main className="hod-content">
          <PortalBackButton role="hod" fallbackTo={fallbackTo} />
          {children}
        </main>

      </div>

    </div>
  );
}

export default HODLayout;