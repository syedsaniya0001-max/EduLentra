import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const BRANCHES = [
  "ECE",
  "EEE",
  "CSE",
  "CSE-AI",
  "CSE-AIML",
  "CSE-IT",
  "CSE-AIDS",
  "CIVIL",
  "MECH",
  "PHARMACY",
  "BBA",
  "BCA",
  "MBA",
];

const BRANCH_STUDENTS = {
  ECE: 420,
  EEE: 365,
  CSE: 680,
  "CSE-AI": 310,
  "CSE-AIML": 390,
  "CSE-IT": 280,
  "CSE-AIDS": 295,
  CIVIL: 240,
  MECH: 410,
  PHARMACY: 350,
  BBA: 220,
  BCA: 260,
  MBA: 180,
};

const STUDENTS = [
  {
    id: 1,
    name: "Arjun Kumar",
    branch: "CSE",
    year: "3rd Year",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Sharma",
    branch: "ECE",
    year: "2nd Year",
    status: "Active",
  },
  {
    id: 3,
    name: "Rahul Reddy",
    branch: "CSE-AIML",
    year: "4th Year",
    status: "Active",
  },
  {
    id: 4,
    name: "Sneha Rao",
    branch: "MBA",
    year: "1st Year",
    status: "Active",
  },
  {
    id: 5,
    name: "Vikram Singh",
    branch: "MECH",
    year: "3rd Year",
    status: "Active",
  },
];

const FACULTY = [
  {
    id: 1,
    name: "Dr. Anil Kumar",
    department: "CSE",
    role: "Professor",
  },
  {
    id: 2,
    name: "Dr. Meena Rao",
    department: "ECE",
    role: "Associate Professor",
  },
  {
    id: 3,
    name: "Prof. Suresh Reddy",
    department: "MECH",
    role: "Assistant Professor",
  },
  {
    id: 4,
    name: "Dr. Kavitha Sharma",
    department: "PHARMACY",
    role: "Professor",
  },
];

const NAV_ITEMS = [
  ["Dashboard", "▦"],
  ["Students", "♙"],
  ["Faculty", "♟"],
  ["HOD & Departments", "⌂"],
  ["Announcements", "▣"],
  ["Placements", "◈"],
  ["Achievements / Gallery", "▧"],
  ["Events", "◷"],
  ["Requests", "✉"],
  ["Notifications", "🔔"],
  ["Profile", "●"],
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

const contentCategories = ["Academic", "Achievement", "Cultural", "Sports", "Other"];

const readAdminItems = (key) => {
  try {
    const savedItems = localStorage.getItem(key);
    const parsedItems = savedItems ? JSON.parse(savedItems) : [];
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    return [];
  }
};

const saveAdminItems = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
  }
};

const createAchievementDraft = () => ({
  title: "",
  category: "Academic",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  imageUrl: "",
});

const createEventDraft = () => ({
  title: "",
  category: "Academic",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  description: "",
});

const announcementCategories = ["Academic", "Event", "Placement", "Policy", "General"];
const announcementPriorities = ["Normal", "High", "Urgent"];

const createAnnouncementDraft = () => ({
  title: "",
  category: "General",
  priority: "Normal",
  audience: "All",
  date: new Date().toISOString().slice(0, 10),
  message: "",
});

const createPlacementDraft = () => ({
  company: "",
  role: "",
  branch: BRANCHES[0],
  location: "",
  package: "",
  deadline: new Date().toISOString().slice(0, 10),
  description: "",
});

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeSection, setActiveSection] = useState("Dashboard");

  const [selectedBranch, setSelectedBranch] = useState("All");

  const [studentSearch, setStudentSearch] = useState("");
  const [facultySearch, setFacultySearch] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);
  const [achievementPosts, setAchievementPosts] = useState(() =>
    readAdminItems("adminAchievementPosts")
  );
  const [achievementDraft, setAchievementDraft] = useState(createAchievementDraft);
  const [achievementSearch, setAchievementSearch] = useState("");
  const [achievementCategory, setAchievementCategory] = useState("All");
  const [events, setEvents] = useState(() => readAdminItems("adminEvents"));
  const [eventDraft, setEventDraft] = useState(createEventDraft);
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategory, setEventCategory] = useState("All");
  const [eventDateFilter, setEventDateFilter] = useState("All");
  const [announcements, setAnnouncements] = useState(() => readAdminItems("adminAnnouncements"));
  const [announcementDraft, setAnnouncementDraft] = useState(createAnnouncementDraft);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementCategory, setAnnouncementCategory] = useState("All");
  const [announcementPriority, setAnnouncementPriority] = useState("All");
  const [placements, setPlacements] = useState(() => readAdminItems("adminPlacements"));
  const [placementDraft, setPlacementDraft] = useState(createPlacementDraft);
  const [placementSearch, setPlacementSearch] = useState("");
  const [placementBranch, setPlacementBranch] = useState("All");
  const [placementStatus, setPlacementStatus] = useState("All");

  const [requests, setRequests] = useState([
    {
      id: 1,
      title: "New Faculty Requirement",
      from: "HOD - CSE",
      type: "Faculty",
      status: "Pending",
    },
    {
      id: 2,
      title: "Department Equipment Request",
      from: "HOD - ECE",
      type: "Department",
      status: "Pending",
    },
    {
      id: 3,
      title: "Event Approval",
      from: "HOD - MBA",
      type: "Event",
      status: "Approved",
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "2 new HOD requests need review.",
      read: false,
    },
    {
      id: 2,
      text: "Placement update received.",
      read: false,
    },
    {
      id: 3,
      text: "New event approval request.",
      read: true,
    },
  ]);

  const totalStudents = Object.values(BRANCH_STUDENTS).reduce(
    (total, value) => total + value,
    0
  );

  const totalFaculty = FACULTY.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase().trim();

    return STUDENTS.filter((student) => {
      const branchMatch =
        selectedBranch === "All" ||
        student.branch === selectedBranch;

      const searchMatch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.branch.toLowerCase().includes(query);

      return branchMatch && searchMatch;
    });
  }, [selectedBranch, studentSearch]);

  const filteredFaculty = useMemo(() => {
    const query = facultySearch.toLowerCase().trim();

    return FACULTY.filter((member) => {
      return (
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
      );
    });
  }, [facultySearch]);

  const filteredAchievementPosts = useMemo(() => {
    const query = achievementSearch.toLowerCase().trim();

    return achievementPosts.filter((post) => {
      const matchesCategory =
        achievementCategory === "All" || post.category === achievementCategory;
      const matchesSearch =
        !query ||
        `${post.title} ${post.description} ${post.category}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [achievementPosts, achievementCategory, achievementSearch]);

  const filteredEvents = useMemo(() => {
    const query = eventSearch.toLowerCase().trim();
    const today = new Date().toISOString().slice(0, 10);

    return events.filter((event) => {
      const matchesCategory = eventCategory === "All" || event.category === eventCategory;
      const matchesDate =
        eventDateFilter === "All" ||
        (eventDateFilter === "Upcoming" && event.date >= today) ||
        (eventDateFilter === "Past" && event.date < today);
      const matchesSearch =
        !query ||
        `${event.title} ${event.location} ${event.description} ${event.category}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesDate && matchesSearch;
    });
  }, [events, eventCategory, eventDateFilter, eventSearch]);

  const filteredAnnouncements = useMemo(() => {
    const query = announcementSearch.toLowerCase().trim();

    return announcements.filter((announcement) => {
      const matchesCategory =
        announcementCategory === "All" || announcement.category === announcementCategory;
      const matchesPriority =
        announcementPriority === "All" || announcement.priority === announcementPriority;
      const matchesSearch =
        !query ||
        `${announcement.title} ${announcement.message} ${announcement.audience} ${announcement.category}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [announcements, announcementCategory, announcementPriority, announcementSearch]);

  const filteredPlacements = useMemo(() => {
    const query = placementSearch.toLowerCase().trim();
    const today = new Date().toISOString().slice(0, 10);

    return placements.filter((placement) => {
      const matchesBranch = placementBranch === "All" || placement.branch === placementBranch;
      const isOpen = placement.deadline >= today;
      const matchesStatus =
        placementStatus === "All" ||
        (placementStatus === "Open" && isOpen) ||
        (placementStatus === "Closed" && !isOpen);
      const matchesSearch =
        !query ||
        `${placement.company} ${placement.role} ${placement.branch} ${placement.location} ${placement.description} ${placement.package}`
          .toLowerCase()
          .includes(query);
      return matchesBranch && matchesStatus && matchesSearch;
    });
  }, [placements, placementBranch, placementSearch, placementStatus]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (
      adminId.trim().toUpperCase() === "ADMIN" &&
      password === "admin123"
    ) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid Admin ID or password.");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setAdminId("");
    setPassword("");
    setLoginError("");
    setActiveSection("Dashboard");
    setSelectedBranch("All");
    setShowNotifications(false);
  };

  const openSection = (section) => {
    setActiveSection(section);
    setShowNotifications(false);
  };

  const approveRequest = (requestId) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "Approved",
            }
          : request
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const addAchievementPost = (event) => {
    event.preventDefault();
    if (!achievementDraft.title.trim() || !achievementDraft.description.trim()) return;

    const nextPosts = [
      { ...achievementDraft, id: `${Date.now()}`, title: achievementDraft.title.trim() },
      ...achievementPosts,
    ];
    setAchievementPosts(nextPosts);
    saveAdminItems("adminAchievementPosts", nextPosts);
    setAchievementDraft(createAchievementDraft());
  };

  const deleteAchievementPost = (id) => {
    const nextPosts = achievementPosts.filter((post) => post.id !== id);
    setAchievementPosts(nextPosts);
    saveAdminItems("adminAchievementPosts", nextPosts);
  };

  const addEvent = (event) => {
    event.preventDefault();
    if (!eventDraft.title.trim() || !eventDraft.location.trim() || !eventDraft.description.trim()) return;

    const nextEvents = [
      { ...eventDraft, id: `${Date.now()}`, title: eventDraft.title.trim() },
      ...events,
    ];
    setEvents(nextEvents);
    saveAdminItems("adminEvents", nextEvents);
    setEventDraft(createEventDraft());
  };

  const deleteEvent = (id) => {
    const nextEvents = events.filter((event) => event.id !== id);
    setEvents(nextEvents);
    saveAdminItems("adminEvents", nextEvents);
  };

  const addAnnouncement = (event) => {
    event.preventDefault();
    if (!announcementDraft.title.trim() || !announcementDraft.message.trim()) return;

    const nextAnnouncements = [
      { ...announcementDraft, id: `${Date.now()}`, title: announcementDraft.title.trim() },
      ...announcements,
    ];
    setAnnouncements(nextAnnouncements);
    saveAdminItems("adminAnnouncements", nextAnnouncements);
    setAnnouncementDraft(createAnnouncementDraft());
  };

  const deleteAnnouncement = (id) => {
    const nextAnnouncements = announcements.filter((announcement) => announcement.id !== id);
    setAnnouncements(nextAnnouncements);
    saveAdminItems("adminAnnouncements", nextAnnouncements);
  };

  const addPlacement = (event) => {
    event.preventDefault();
    if (!placementDraft.company.trim() || !placementDraft.role.trim() || !placementDraft.description.trim()) return;

    const nextPlacements = [
      { ...placementDraft, id: `${Date.now()}`, company: placementDraft.company.trim() },
      ...placements,
    ];
    setPlacements(nextPlacements);
    saveAdminItems("adminPlacements", nextPlacements);
    setPlacementDraft(createPlacementDraft());
  };

  const deletePlacement = (id) => {
    const nextPlacements = placements.filter((placement) => placement.id !== id);
    setPlacements(nextPlacements);
    saveAdminItems("adminPlacements", nextPlacements);
  };

  /* =========================
     ADMIN LOGIN
  ========================= */

  if (!loggedIn) {
    return (
      <section className="admin-login-page">
        <div className="admin-login-title">
          <h1>EduLentra Admin Portal</h1>

          <p>
            Manage your campus through one connected platform.
          </p>
        </div>

        <div className="laptop">
          <div className="laptop-screen">
            <div className="screen-content">
              <h2>Welcome to EduLentra</h2>

              <p className="admin-welcome">
                Admin Login
              </p>

              <form
                className="admin-form"
                onSubmit={handleLogin}
              >
                <input
                  type="text"
                  placeholder="Admin ID"
                  value={adminId}
                  onChange={(event) =>
                    setAdminId(event.target.value)
                  }
                  autoComplete="username"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                />

                <button type="submit">
                  Login
                </button>

                {loginError && (
                  <p className="login-error">
                    {loginError}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="laptop-base">
            <div className="keyboard"></div>
            <div className="touchpad"></div>
          </div>
        </div>
      </section>
    );
  }

  /* =========================
     DASHBOARD
  ========================= */

  const dashboardContent = (
    <>
      <div className="stats-grid">
        <StatCard
          icon="♙"
          title="Total Students"
          value={totalStudents}
        />

        <StatCard
          icon="♟"
          title="Total Faculty"
          value={`${totalFaculty}+`}
        />

        <StatCard
          icon="⌂"
          title="Departments"
          value={BRANCHES.length}
        />

        <StatCard
          icon="✉"
          title="Pending Requests"
          value={pendingRequests}
        />
      </div>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Branch-wise Students</h2>

            <p>
              Select a branch to view its student details.
            </p>
          </div>

          <select
            value={selectedBranch}
            onChange={(event) =>
              setSelectedBranch(event.target.value)
            }
          >
            <option value="All">
              All Branches
            </option>

            {BRANCHES.map((branch) => (
              <option
                key={branch}
                value={branch}
              >
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="branch-grid">
          {BRANCHES.map((branch) => (
            <button
              key={branch}
              type="button"
              className={`branch-card ${
                selectedBranch === branch
                  ? "selected"
                  : ""
              }`}
              onClick={() => {
                setSelectedBranch(branch);
                setActiveSection("Students");
              }}
            >
              <span>{branch}</span>

              <strong>
                {BRANCH_STUDENTS[branch]}
              </strong>

              <small>
                Students
              </small>
            </button>
          ))}
        </div>
      </section>

      <div className="two-column">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Recent Requests</h2>

              <p>
                Latest requests received by Admin.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                openSection("Requests")
              }
            >
              View all
            </button>
          </div>

          {requests.map((request) => (
            <div
              className="list-row"
              key={request.id}
            >
              <div>
                <strong>
                  {request.title}
                </strong>

                <span>
                  {request.from} · {request.type}
                </span>
              </div>

              <span
                className={`status ${request.status.toLowerCase()}`}
              >
                {request.status}
              </span>
            </div>
          ))}
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Recent Activity</h2>

              <p>
                System activity overview.
              </p>
            </div>
          </div>

          <div className="activity-item">
            <span>✓</span>

            <div>
              <strong>
                Student records updated
              </strong>

              <small>
                Today
              </small>
            </div>
          </div>

          <div className="activity-item">
            <span>✓</span>

            <div>
              <strong>
                Faculty details reviewed
              </strong>

              <small>
                Today
              </small>
            </div>
          </div>

          <div className="activity-item">
            <span>✓</span>

            <div>
              <strong>
                Department request received
              </strong>

              <small>
                Yesterday
              </small>
            </div>
          </div>
        </section>
      </div>
    </>
  );

  /* =========================
     STUDENTS
  ========================= */

  const studentsContent = (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <h2>Students</h2>

          <p>
            View student records branch-wise.
          </p>
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="Search students..."
          value={studentSearch}
          onChange={(event) =>
            setStudentSearch(event.target.value)
          }
        />
      </div>

      <div className="filter-row">
        <button
          type="button"
          className={`filter ${
            selectedBranch === "All"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSelectedBranch("All")
          }
        >
          All
        </button>

        {BRANCHES.map((branch) => (
          <button
            type="button"
            key={branch}
            className={`filter ${
              selectedBranch === branch
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSelectedBranch(branch)
            }
          >
            {branch}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  {student.name}
                </td>

                <td>
                  {student.branch}
                </td>

                <td>
                  {student.year}
                </td>

                <td>
                  <span className="status approved">
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="empty-state">
            No students match the selected filter.
          </div>
        )}
      </div>
    </section>
  );

  /* =========================
     FACULTY
  ========================= */

  const facultyContent = (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <h2>Faculty</h2>

          <p>
            Manage faculty records across departments.
          </p>
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="Search faculty..."
          value={facultySearch}
          onChange={(event) =>
            setFacultySearch(event.target.value)
          }
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {filteredFaculty.map((member) => (
              <tr key={member.id}>
                <td>
                  {member.name}
                </td>

                <td>
                  {member.department}
                </td>

                <td>
                  {member.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  /* =========================
     HOD & DEPARTMENTS
  ========================= */

  const hodContent = (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <h2>
            HOD & Departments
          </h2>

          <p>
            Manage department and HOD information.
          </p>
        </div>
      </div>

      <div className="department-list">
        {BRANCHES.map((branch, index) => (
          <div
            className="department-row"
            key={branch}
          >
            <div className="department-badge">
              {branch}
            </div>

            <div>
              <strong>
                {branch} Department
              </strong>

              <span>
                HOD {index + 1} · Department administration
              </span>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() => {
                setSelectedBranch(branch);
                setActiveSection("Requests");
              }}
            >
              View Requests
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  /* =========================
     REQUESTS
  ========================= */

  const requestsContent = (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <h2>Requests</h2>

          <p>
            Review requests submitted by HODs and departments.
          </p>
        </div>
      </div>

      {requests.map((request) => (
        <div
          className="request-card"
          key={request.id}
        >
          <div>
            <h3>
              {request.title}
            </h3>

            <p>
              {request.from} · {request.type}
            </p>
          </div>

          <div className="request-actions">
            <span
              className={`status ${request.status.toLowerCase()}`}
            >
              {request.status}
            </span>

            {request.status === "Pending" && (
              <button
                type="button"
                onClick={() =>
                  approveRequest(request.id)
                }
              >
                Approve
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );

  /* =========================
     NOTIFICATIONS
  ========================= */

  const notificationsContent = (
    <section className="content-card">
      <div className="section-heading">
        <div>
          <h2>Notifications</h2>

          <p>
            System notifications and important updates.
          </p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={markAllNotificationsRead}
        >
          Mark all read
        </button>
      </div>

      {notifications.map((notification) => (
        <div
          className={`notification-row ${
            notification.read ? "read" : ""
          }`}
          key={notification.id}
        >
          <span className="notification-dot"></span>

          <p>
            {notification.text}
          </p>

          <small>
            {notification.read ? "Read" : "New"}
          </small>
        </div>
      ))}
    </section>
  );

  /* =========================
     PROFILE
  ========================= */

  const profileContent = (
    <section className="content-card profile-card">
      <div className="profile-avatar">
        A
      </div>

      <h2>
        Administrator
      </h2>

      <p>
        Central Admin Account
      </p>

      <div className="profile-details">
        <div>
          <span>
            Admin ID
          </span>

          <strong>
            ADMIN
          </strong>
        </div>

        <div>
          <span>
            Role
          </span>

          <strong>
            Administrator
          </strong>
        </div>

        <div>
          <span>
            Access
          </span>

          <strong>
            Full System Management
          </strong>
        </div>
      </div>
    </section>
  );

  /* =========================
     SIMPLE MANAGEMENT SECTIONS
  ========================= */

  const achievementsContent = (
    <section className="content-card admin-manager">
      <div className="section-heading">
        <div>
          <h2>Achievements & Gallery</h2>
          <p>Publish and manage campus achievements and gallery posts.</p>
        </div>
        <div className="admin-manager-filters">
          <input
            className="search-input"
            type="search"
            placeholder="Search posts..."
            value={achievementSearch}
            onChange={(event) => setAchievementSearch(event.target.value)}
          />
          <select
            className="filter-select"
            aria-label="Filter achievement posts by category"
            value={achievementCategory}
            onChange={(event) => setAchievementCategory(event.target.value)}
          >
            <option value="All">All categories</option>
            {contentCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <form className="admin-entry-form" onSubmit={addAchievementPost}>
        <h3>New post</h3>
        <div className="admin-entry-fields">
          <input
            aria-label="Post title"
            placeholder="Post title"
            value={achievementDraft.title}
            onChange={(event) => setAchievementDraft({ ...achievementDraft, title: event.target.value })}
            required
          />
          <select
            aria-label="Post category"
            value={achievementDraft.category}
            onChange={(event) => setAchievementDraft({ ...achievementDraft, category: event.target.value })}
          >
            {contentCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            aria-label="Post date"
            type="date"
            value={achievementDraft.date}
            onChange={(event) => setAchievementDraft({ ...achievementDraft, date: event.target.value })}
            required
          />
          <input
            aria-label="Image URL"
            type="url"
            placeholder="Image URL (optional)"
            value={achievementDraft.imageUrl}
            onChange={(event) => setAchievementDraft({ ...achievementDraft, imageUrl: event.target.value })}
          />
          <textarea
            aria-label="Post description"
            placeholder="Describe the achievement or gallery post"
            value={achievementDraft.description}
            onChange={(event) => setAchievementDraft({ ...achievementDraft, description: event.target.value })}
            required
          />
        </div>
        <button className="admin-submit-button" type="submit">Publish post</button>
      </form>

      <div className="admin-entry-grid">
        {filteredAchievementPosts.map((post) => (
          <article className="admin-entry-card" key={post.id}>
            {post.imageUrl && <img src={post.imageUrl} alt="" className="admin-entry-image" />}
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{post.category}</span><time dateTime={post.date}>{post.date}</time></div>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <button type="button" className="admin-delete-button" onClick={() => deleteAchievementPost(post.id)}>Delete post</button>
            </div>
          </article>
        ))}
        {filteredAchievementPosts.length === 0 && (
          <p className="admin-empty-state">No posts match your search or category.</p>
        )}
      </div>
    </section>
  );

  const eventsContent = (
    <section className="content-card admin-manager">
      <div className="section-heading">
        <div>
          <h2>Events</h2>
          <p>Create and manage campus events.</p>
        </div>
        <div className="admin-manager-filters">
          <input
            className="search-input"
            type="search"
            placeholder="Search events..."
            value={eventSearch}
            onChange={(event) => setEventSearch(event.target.value)}
          />
          <select
            className="filter-select"
            aria-label="Filter events by category"
            value={eventCategory}
            onChange={(event) => setEventCategory(event.target.value)}
          >
            <option value="All">All categories</option>
            {contentCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Filter events by date"
            value={eventDateFilter}
            onChange={(event) => setEventDateFilter(event.target.value)}
          >
            <option value="All">All dates</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Past">Past</option>
          </select>
        </div>
      </div>

      <form className="admin-entry-form" onSubmit={addEvent}>
        <h3>New event</h3>
        <div className="admin-entry-fields">
          <input
            aria-label="Event title"
            placeholder="Event title"
            value={eventDraft.title}
            onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })}
            required
          />
          <select
            aria-label="Event category"
            value={eventDraft.category}
            onChange={(event) => setEventDraft({ ...eventDraft, category: event.target.value })}
          >
            {contentCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            aria-label="Event date"
            type="date"
            value={eventDraft.date}
            onChange={(event) => setEventDraft({ ...eventDraft, date: event.target.value })}
            required
          />
          <input
            aria-label="Event location"
            placeholder="Location"
            value={eventDraft.location}
            onChange={(event) => setEventDraft({ ...eventDraft, location: event.target.value })}
            required
          />
          <textarea
            aria-label="Event description"
            placeholder="Event description"
            value={eventDraft.description}
            onChange={(event) => setEventDraft({ ...eventDraft, description: event.target.value })}
            required
          />
        </div>
        <button className="admin-submit-button" type="submit">Add event</button>
      </form>

      <div className="admin-entry-grid">
        {filteredEvents.map((event) => (
          <article className="admin-entry-card" key={event.id}>
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{event.category}</span><time dateTime={event.date}>{event.date}</time></div>
              <h3>{event.title}</h3>
              <p className="admin-event-location">{event.location}</p>
              <p>{event.description}</p>
              <button type="button" className="admin-delete-button" onClick={() => deleteEvent(event.id)}>Delete event</button>
            </div>
          </article>
        ))}
        {filteredEvents.length === 0 && (
          <p className="admin-empty-state">No events match your search or filters.</p>
        )}
      </div>
    </section>
  );

  const announcementsContent = (
    <section className="content-card admin-manager">
      <div className="section-heading">
        <div>
          <h2>Announcements</h2>
          <p>Publish and manage campus-wide announcements.</p>
        </div>
        <div className="admin-manager-filters">
          <input className="search-input" type="search" placeholder="Search announcements..." value={announcementSearch} onChange={(event) => setAnnouncementSearch(event.target.value)} />
          <select className="filter-select" aria-label="Filter announcements by category" value={announcementCategory} onChange={(event) => setAnnouncementCategory(event.target.value)}>
            <option value="All">All categories</option>
            {announcementCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select className="filter-select" aria-label="Filter announcements by priority" value={announcementPriority} onChange={(event) => setAnnouncementPriority(event.target.value)}>
            <option value="All">All priorities</option>
            {announcementPriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </div>
      </div>

      <form className="admin-entry-form" onSubmit={addAnnouncement}>
        <h3>New announcement</h3>
        <div className="admin-entry-fields">
          <input aria-label="Announcement title" placeholder="Announcement title" value={announcementDraft.title} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, title: event.target.value })} required />
          <select aria-label="Announcement category" value={announcementDraft.category} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, category: event.target.value })}>
            {announcementCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select aria-label="Announcement priority" value={announcementDraft.priority} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, priority: event.target.value })}>
            {announcementPriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <select aria-label="Announcement audience" value={announcementDraft.audience} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, audience: event.target.value })}>
            <option value="All">Everyone</option>
            <option value="Students">Students</option>
            <option value="Faculty">Faculty</option>
            <option value="Staff">Staff</option>
          </select>
          <input aria-label="Announcement date" type="date" value={announcementDraft.date} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, date: event.target.value })} required />
          <textarea aria-label="Announcement message" placeholder="Announcement details" value={announcementDraft.message} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, message: event.target.value })} required />
        </div>
        <button className="admin-submit-button" type="submit">Publish announcement</button>
      </form>

      <div className="admin-entry-grid">
        {filteredAnnouncements.map((announcement) => (
          <article className="admin-entry-card" key={announcement.id}>
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{announcement.category}</span><span>{announcement.priority}</span><time dateTime={announcement.date}>{announcement.date}</time></div>
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              <p className="admin-event-location">Audience: {announcement.audience === "All" ? "Everyone" : announcement.audience}</p>
              <button type="button" className="admin-delete-button" onClick={() => deleteAnnouncement(announcement.id)}>Delete announcement</button>
            </div>
          </article>
        ))}
        {filteredAnnouncements.length === 0 && <p className="admin-empty-state">No announcements match your search or filters.</p>}
      </div>
    </section>
  );

  const placementsContent = (
    <section className="content-card admin-manager">
      <div className="section-heading">
        <div>
          <h2>Placements</h2>
          <p>Publish and manage placement opportunities.</p>
        </div>
        <div className="admin-manager-filters">
          <input className="search-input" type="search" placeholder="Search placements..." value={placementSearch} onChange={(event) => setPlacementSearch(event.target.value)} />
          <select className="filter-select" aria-label="Filter placements by branch" value={placementBranch} onChange={(event) => setPlacementBranch(event.target.value)}>
            <option value="All">All branches</option>
            {BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <select className="filter-select" aria-label="Filter placements by status" value={placementStatus} onChange={(event) => setPlacementStatus(event.target.value)}>
            <option value="All">All deadlines</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <form className="admin-entry-form" onSubmit={addPlacement}>
        <h3>New placement</h3>
        <div className="admin-entry-fields">
          <input aria-label="Company name" placeholder="Company name" value={placementDraft.company} onChange={(event) => setPlacementDraft({ ...placementDraft, company: event.target.value })} required />
          <input aria-label="Job role" placeholder="Job role" value={placementDraft.role} onChange={(event) => setPlacementDraft({ ...placementDraft, role: event.target.value })} required />
          <select aria-label="Eligible branch" value={placementDraft.branch} onChange={(event) => setPlacementDraft({ ...placementDraft, branch: event.target.value })}>
            {BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <input aria-label="Placement location" placeholder="Location" value={placementDraft.location} onChange={(event) => setPlacementDraft({ ...placementDraft, location: event.target.value })} required />
          <input aria-label="Package" placeholder="Package (optional)" value={placementDraft.package} onChange={(event) => setPlacementDraft({ ...placementDraft, package: event.target.value })} />
          <input aria-label="Application deadline" type="date" value={placementDraft.deadline} onChange={(event) => setPlacementDraft({ ...placementDraft, deadline: event.target.value })} required />
          <textarea aria-label="Placement details" placeholder="Role and application details" value={placementDraft.description} onChange={(event) => setPlacementDraft({ ...placementDraft, description: event.target.value })} required />
        </div>
        <button className="admin-submit-button" type="submit">Publish placement</button>
      </form>

      <div className="admin-entry-grid">
        {filteredPlacements.map((placement) => (
          <article className="admin-entry-card" key={placement.id}>
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{placement.branch}</span><time dateTime={placement.deadline}>Apply by {placement.deadline}</time></div>
              <h3>{placement.company}</h3>
              <p className="admin-event-location">{placement.role} · {placement.location}{placement.package ? ` · ${placement.package}` : ""}</p>
              <p>{placement.description}</p>
              <button type="button" className="admin-delete-button" onClick={() => deletePlacement(placement.id)}>Delete placement</button>
            </div>
          </article>
        ))}
        {filteredPlacements.length === 0 && <p className="admin-empty-state">No placements match your search or filters.</p>}
      </div>
    </section>
  );

  let content = dashboardContent;

  if (activeSection === "Students") {
    content = studentsContent;
  }

  if (activeSection === "Faculty") {
    content = facultyContent;
  }

  if (activeSection === "HOD & Departments") {
    content = hodContent;
  }

  if (activeSection === "Announcements") {
    content = announcementsContent;
  }

  if (activeSection === "Placements") {
    content = placementsContent;
  }

  if (activeSection === "Achievements / Gallery") {
    content = achievementsContent;
  }

  if (activeSection === "Events") {
    content = eventsContent;
  }

  if (activeSection === "Requests") {
    content = requestsContent;
  }

  if (activeSection === "Notifications") {
    content = notificationsContent;
  }

  if (activeSection === "Profile") {
    content = profileContent;
  }

  /* =========================
     ADMIN DASHBOARD
  ========================= */

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          Edu<span>Lentra</span>
        </div>

        <p className="sidebar-label">
          ADMIN PORTAL
        </p>

        <nav>
          <button
            type="button"
            className="nav-item"
            onClick={() => navigate("/")}
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </button>

          {NAV_ITEMS.map(([name, icon]) => (
            <button
              type="button"
              key={name}
              className={`nav-item ${
                activeSection === name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                openSection(name)
              }
            >
              <span className="nav-icon">
                {icon}
              </span>

              <span>
                {name}
              </span>

              {name === "Requests" &&
                pendingRequests > 0 && (
                  <b className="nav-count">
                    {pendingRequests}
                  </b>
                )}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="nav-item logout"
          onClick={handleLogout}
        >
          <span className="nav-icon">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="dashboard-header">
          <div className="greeting">
            <h1>
              {getGreeting()}, Admin{" "}
              <span>👋</span>
            </h1>

            <p>
              Here’s what’s happening across your campus.
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Home"
              title="Home"
              onClick={() => navigate("/")}
            >
              ⌂
            </button>

            <div className="notification-wrap">
              <button
                type="button"
                className="icon-button"
                aria-label="Notifications"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
              >
                <span className="bell-icon">
                  ♢
                </span>

                {unreadNotifications > 0 && (
                  <span className="notification-count">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-popover">
                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <button
                      type="button"
                      onClick={
                        markAllNotificationsRead
                      }
                    >
                      Mark read
                    </button>
                  </div>

                  {notifications.map(
                    (notification) => (
                      <p
                        key={notification.id}
                        className={
                          !notification.read
                            ? "unread"
                            : ""
                        }
                      >
                        {notification.text}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="profile-button"
              aria-label="Admin Profile"
              onClick={() =>
                openSection("Profile")
              }
            >
              <span className="profile-symbol">
                A
              </span>
            </button>
          </div>
        </header>

        <div className="page-title">
          <h2>
            {activeSection}
          </h2>

          {activeSection === "Dashboard" && (
            <span>
              Admin overview
            </span>
          )}
        </div>

        <div className="dashboard-content">
          {content}
        </div>
      </main>
    </div>
  );
}

export default Admin;