import React from "react";
import { useNavigate } from "react-router-dom";
import "./Gallery.css";

import homeimg from "../assets/homeimg.jpg";
import homeimg1 from "../assets/homeimg1.jpg";
import homeimg2 from "../assets/homeimg2.jpg";
import homeimg3 from "../assets/homeimg3.webp";
import homeimg4 from "../assets/homeimg4.jpg";
import homeimg5 from "../assets/homeimg5.jpg";

function Gallery() {

  const navigate = useNavigate();

  const openGallery = (type) => {
    navigate(`/gallery/${type}`);
  };

  return (
    <section className="gallery-section" id="gallery">

      <h2 className="gall-head">Achievement Gallery</h2>

      <p className="gallery-text">
        Explore memorable moments from events, workshops, placements and student activities.
      </p>

      <div className="gallery-container">

        {/* Hackathon */}
        <div className="gallery-card">
          <div className="gallery-card-inner">

            <div className="gallery-card-front">
              <img src={homeimg} alt="Hackathon" />

              <div className="gallery-title">
                <h3>
                  <span className="gallery-emoji">💻</span> Hackathon
                </h3>
              </div>
            </div>

            <div className="gallery-card-back">
              <h3>💻 Hackathon</h3>

              <p>
                Innovation, teamwork and creative problem solving come together
                as students build ideas into real solutions.
              </p>

              <span className="gallery-slogan">
                "Code. Create. Innovate."
              </span>

              <button onClick={() => openGallery("hackathon")}>
                View More
              </button>
            </div>

          </div>
        </div>


        {/* Workshop */}
        <div className="gallery-card">
          <div className="gallery-card-inner">

            <div className="gallery-card-front">
              <img src={homeimg1} alt="Workshop" />

              <div className="gallery-title">
                <h3>
                  <span className="gallery-emoji">🛠️</span> Workshop
                </h3>
              </div>
            </div>

            <div className="gallery-card-back">
              <h3>🛠️ Workshop</h3>

              <p>
                Interactive workshops help students gain practical knowledge,
                technical skills and industry experience.
              </p>

              <span className="gallery-slogan">
                "Learn. Practice. Grow."
              </span>

              <button onClick={() => openGallery("workshop")}>
                View More
              </button>
            </div>

          </div>
        </div>


        {/* Placements */}
        <div className="gallery-card">
          <div className="gallery-card-inner">

            <div className="gallery-card-front">
              <img src={homeimg2} alt="Placements" />

              <div className="gallery-title">
                <h3>
                  <span className="gallery-emoji">🎯</span> Placements
                </h3>
              </div>
            </div>

            <div className="gallery-card-back">
              <h3>🎯 Placements</h3>

              <p>
                Students connect with leading companies and explore career
                opportunities through campus recruitment.
              </p>

              <span className="gallery-slogan">
                "Dream. Prepare. Achieve."
              </span>

              <button onClick={() => openGallery("placements")}>
                View More
              </button>
            </div>

          </div>
        </div>


        {/* Sports */}
        <div className="gallery-card">
          <div className="gallery-card-inner">

            <div className="gallery-card-front">
              <img src={homeimg3} alt="Sports" />

              <div className="gallery-title">
                <h3>
                  <span className="gallery-emoji">🏆</span> Sports
                </h3>
              </div>
            </div>

            <div className="gallery-card-back">
              <h3>🏆 Sports</h3>

              <p>
                College sports activities encourage teamwork, discipline,
                leadership and a healthy competitive spirit.
              </p>

              <span className="gallery-slogan">
                "Play. Perform. Win."
              </span>

              <button onClick={() => openGallery("sports")}>
                View More
              </button>
            </div>

          </div>
        </div>


        {/* Cultural Fest */}
        <div className="gallery-card">
          <div className="gallery-card-inner">

            <div className="gallery-card-front">
              <img src={homeimg4} alt="Cultural Fest" />

              <div className="gallery-title">
                <h3>
                  <span className="gallery-emoji">🎭</span> Cultural Fest
                </h3>
              </div>
            </div>

            <div className="gallery-card-back">
              <h3>🎭 Cultural Fest</h3>

              <p>
                Cultural celebrations bring students together to showcase
                creativity, talent, tradition and entertainment.
              </p>

              <span className="gallery-slogan">
                "Celebrate. Express. Inspire."
              </span>

              <button onClick={() => openGallery("cultural-fest")}>
                View More
              </button>
            </div>

          </div>
        </div>


        {/* NSS */}
        <div className="gallery-card">
          <div className="gallery-card-inner">

            <div className="gallery-card-front">
              <img src={homeimg5} alt="NSS Activities" />

              <div className="gallery-title">
                <h3>
                  <span className="gallery-emoji">🤝</span> NSS Activities
                </h3>
              </div>
            </div>

            <div className="gallery-card-back">
              <h3>🤝 NSS Activities</h3>

              <p>
                NSS activities encourage students to serve the community
                through social responsibility and meaningful initiatives.
              </p>

              <span className="gallery-slogan">
                "Serve. Support. Make a Difference."
              </span>

              <button onClick={() => openGallery("nss")}>
                View More
              </button>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}

export default Gallery;