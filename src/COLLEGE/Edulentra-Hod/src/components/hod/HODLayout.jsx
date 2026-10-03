import HODSidebar from "./HODSidebar";
import HODHeader from "./HODHeader";
import "../../styles/hod/HODLayout.css";

function HODLayout({ children }) {
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
          {children}
        </main>

      </div>

    </div>
  );
}

export default HODLayout;