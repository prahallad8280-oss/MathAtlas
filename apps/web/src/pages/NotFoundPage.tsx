import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="centered-page">
      <article className="detail-card">
        <div className="eyebrow">Not Found</div>
        <h2>This page does not exist in the atlas yet.</h2>
        <Link className="primary-button" to="/">
          Return to Dashboard
        </Link>
      </article>
    </div>
  );
}
