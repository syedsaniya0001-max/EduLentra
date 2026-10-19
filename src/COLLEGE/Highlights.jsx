import React from "react";
import { Link } from "react-router-dom";
import "./Highlights.css";

function Highlights(){
    return(
       <section className="highlight-section" id="highlights">
    <h2>Highlights</h2>
    <p className="highlight-intro">
        Stay updated with the latest announcements, placement opportunities,
        study resources, and essential student services - all in one place.
    </p>

    <div className="highlight-cards">

        <Link to="/role" state={{ backTo: "/highlights" }} className="highlight-card">
            <div className="icon">📢</div>
            <h3>Latest Announcements</h3>
            <p>Receive important college notices, exam schedules, events, and circulars.</p>
        </Link>

        <Link to="/role" state={{ backTo: "/highlights" }} className="highlight-card">
            <div className="icon">💼</div>
            <h3>Placement Updates</h3>
            <p>Explore the latest placement drives, company visits, interview schedules, and job opportunities.</p>
        </Link>

        <Link to="/role" state={{ backTo: "/highlights" }} className="highlight-card">
            <div className="icon">📚</div>
            <h3>Quick Access to Notes</h3>
            <p>Download subject notes, study materials, previous papers, and reference resources.</p>
        </Link>

        <Link to="/role" state={{ backTo: "/highlights" }} className="highlight-card">
            <div className="icon">📅</div>
            <h3>Attendance</h3>
            <p>Monitor your attendance percentage and keep track of your academic progress.</p>
        </Link>

        <Link to="/role" state={{ backTo: "/highlights" }} className="highlight-card">
            <div className="icon">📝</div>
            <h3>Outpass Request</h3>
            <p>Apply for outpasses online and check the approval status anytime.</p>
        </Link>

        <Link to="/role" state={{ backTo: "/highlights" }} className="highlight-card">
            <div className="icon">🏆</div>
            <h3>Achievements Gallery</h3>
            <p>Celebrate student achievements, hackathons, certifications, and campus events.</p>
        </Link>

    </div>
</section>

    );

}

export default Highlights;