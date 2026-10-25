import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <main className="college-not-found" aria-labelledby="not-found-title">
      <div className="college-not-found-card">
        <p className="college-not-found-code">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p className="college-not-found-message">
          The page you are looking for may have moved or the address may be incorrect.
        </p>
        <div className="college-not-found-actions">
          <Link className="college-not-found-primary" to="/">
            Go to home
          </Link>
          <Link className="college-not-found-secondary" to="/role">
            Choose a portal
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
