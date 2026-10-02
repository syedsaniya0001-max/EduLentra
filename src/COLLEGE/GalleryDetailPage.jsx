import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./GalleryDetailPage.css";

const galleryData = {

  hackathon: {
    emoji: "💻",
    title: "Hackathon",
    description:
      "Explore memorable moments from our college hackathons where students collaborate, develop innovative ideas and create technology-based solutions.",
    images: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  workshop: {
    emoji: "🛠️",
    title: "Workshop",
    description:
      "Students participate in practical workshops designed to improve technical knowledge, creativity and industry-oriented skills.",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  placements: {
    emoji: "🎯",
    title: "Placements",
    description:
      "Take a look at placement activities, recruitment drives, interviews and career opportunities available to our students.",
    images: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  sports: {
    emoji: "🏆",
    title: "Sports",
    description:
      "College sports activities provide students with opportunities to demonstrate teamwork, discipline, leadership and sporting talent.",
    images: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  "cultural-fest": {
    emoji: "🎭",
    title: "Cultural Fest",
    description:
      "Celebrate the creativity and talent of students through cultural programs, performances, music, dance and artistic activities.",
    images: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  nss: {
    emoji: "🤝",
    title: "NSS Activities",
    description:
      "Discover student-led social initiatives, community service programs and meaningful activities conducted through NSS.",
    images: [
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=80"
    ]
  }

};


function GalleryDetailPage() {

  const navigate = useNavigate();
  const { type } = useParams();

  const data = galleryData[type];

  if (!data) {
    return (
      <div className="gallery-detail-page">

        <header className="gallery-detail-header">

          <h1 className="gallery-detail-logo">
            EduLentra
          </h1>

          <button
            className="gallery-detail-back-btn"
            onClick={() => navigate("/gallery")}
          >
            ← Back
          </button>

        </header>

        <div className="gallery-not-found">
          <h2>Gallery Not Found</h2>

          <button
            onClick={() => navigate("/gallery")}
          >
            Go to Gallery
          </button>
        </div>

      </div>
    );
  }


  return (
    <div className="gallery-detail-page">

      {/* HEADER */}
      <header className="gallery-detail-header">

        {/* LEFT */}
        <h1 className="gallery-detail-logo">
          EduLentra
        </h1>

        {/* RIGHT */}
        <nav className="gallery-detail-nav">

          <button
            className="gallery-detail-back-btn"
            onClick={() => navigate("/gallery")}
          >
            ← Back
          </button>


          {/* LOGIN */}
          <div className="gallery-detail-login-dropdown">

            <span className="gallery-detail-login-link">
              Login ▾
            </span>

            <div className="gallery-detail-login-menu">

              <Link to="/student">
                🎓 <span>Student</span>
              </Link>

              <Link to="/faculty">
                👨‍🏫 <span>Faculty</span>
              </Link>

              <Link to="/hod">
                🏫 <span>HOD</span>
              </Link>

              <Link to="/admin">
                💻 <span>Admin</span>
              </Link>

            </div>

          </div>

        </nav>

      </header>


      {/* CONTENT */}
      <main className="gallery-detail-content">

        <h2>
          <span>{data.emoji}</span> {data.title}
        </h2>

        <p className="gallery-detail-description">
          {data.description}
        </p>


        {/* IMAGE GALLERY */}
        <div className="gallery-detail-grid">

          {data.images.map((image, index) => (
            <div
              className="gallery-detail-image-card"
              key={index}
            >
              <img
                src={image}
                alt={`${data.title} ${index + 1}`}
              />
            </div>
          ))}

        </div>

      </main>

    </div>
  );
}

export default GalleryDetailPage;