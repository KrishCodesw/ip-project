import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div>
      <main>
        <section className="hero"> 



          <div className="container hero-inner">
            <span className="hero-eyebrow">  Reminders</span>
            <h1 className="hero-title">Never miss the moments that matter.</h1>
            <p className="hero-subtitle">
                Reminders helps students and faculty schedule, send and track
              reminders by email and SMS — reliable, private, and beautifully simple.
            </p>
            {/* <div className="hero-cta">
              <Link to="/register" className="btn-primary">Create account</Link>
              <Link to="/login" className="btn-ghost">Sign in</Link>
            </div> */}
            <div className="card" style={{ maxWidth: 440, marginTop: 24 }}>
              <div style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>
                Reminders that reach you when it matters most
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="container">
        <div className="features-grid">
          <div className="feature-card" style={{ textAlign: "left" }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Simple scheduling</h3>
            <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8 }}>
              Create reminders in seconds and choose delivery by email, SMS or both.
            </p>
          </div>
          <div className="feature-card" style={{ textAlign: "left" }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Reliability first</h3>
            <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8 }}>
              Retry logic and failure tracking ensure your messages aren't lost.
            </p>
          </div>
          <div className="feature-card" style={{ textAlign: "left" }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Privacy-focused</h3>
            <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8 }}>
              We design for small classrooms and personal use — your data stays private.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <strong>  Reminders</strong>
            <div style={{ marginTop: 8, color: "var(--muted)" }}>Built by Bhummi Girnara</div>
          </div>
       
        </div>
      </footer>
    </div>
  );
}
