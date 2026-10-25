import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";
import PortalBackButton from "./PortalBackButton";
import { API_BASE_URL } from "../api/config";
import { roleApprovalApi } from "../api/roleApprovalApi";
import {
  clearAuthSession,
  getAuthUser,
  storeAuthSession,
  updateAuthUser,
} from "../api/authSession";
import {
  announcementAudienceLabel,
  announcementsApi,
  toLocalDateTime,
} from "../api/announcementsApi";
import { placementsApi } from "../api/placementsApi";
import { eventsApi } from "../api/eventsApi";
import { galleryApi } from "../api/galleryApi";
import { notificationsApi } from "../api/notificationsApi";

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

const NAV_ITEMS = [
  ["Dashboard", "▦"],
  ["Students", "👨‍🎓"],
  ["Faculty", "👩‍🏫"],
  ["HOD & Departments", "🏢"],
  ["Announcements", "▣"],
  ["Placements", "◈"],
  ["Achievements / Gallery", "▧"],
  ["Events", "◷"],
  ["Requests", "📩"],
  ["Notifications", "🔔"],
  ["Profile", "👤"],
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
  targetRole: "ALL",
  targetDepartment: "",
  targetBranch: "",
  targetSection: "",
  date: new Date().toISOString().slice(0, 10),
  publishAt: "",
  expiresAt: "",
  isActive: true,
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
  eligibility: "",
  applyLink: "",
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
  const [adminUser, setAdminUser] = useState(getAuthUser);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminNameDraft, setAdminNameDraft] = useState(
    () => getAuthUser()?.name || ""
  );
  const [isSavingAdminName, setIsSavingAdminName] = useState(false);
  const [adminProfileMessage, setAdminProfileMessage] = useState("");
  const adminDisplayName =
    adminUser?.name || adminUser?.username || adminId || "Admin";

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [hasSectionHistory, setHasSectionHistory] = useState(false);
  const sectionHistory = useRef([]);

  const [selectedBranch, setSelectedBranch] = useState("All");

  const [studentSearch, setStudentSearch] = useState("");
  const [facultySearch, setFacultySearch] = useState("");
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [hods, setHods] = useState([]);
  const [isLoadingDirectories, setIsLoadingDirectories] = useState(false);
  const [directoryError, setDirectoryError] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);
  const [achievementPosts, setAchievementPosts] = useState([]);
  const [achievementDraft, setAchievementDraft] = useState(createAchievementDraft);
  const [achievementSearch, setAchievementSearch] = useState("");
  const [achievementCategory, setAchievementCategory] = useState("All");
  const [isLoadingAchievementPosts, setIsLoadingAchievementPosts] = useState(false);
  const [isSavingAchievement, setIsSavingAchievement] = useState(false);
  const [deletingAchievementId, setDeletingAchievementId] = useState("");
  const [achievementError, setAchievementError] = useState("");
  const [achievementMessage, setAchievementMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [eventDraft, setEventDraft] = useState(createEventDraft);
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategory, setEventCategory] = useState("All");
  const [eventDateFilter, setEventDateFilter] = useState("All");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState("");
  const [eventError, setEventError] = useState("");
  const [eventMessage, setEventMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [announcementDraft, setAnnouncementDraft] = useState(createAnnouncementDraft);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementCategory, setAnnouncementCategory] = useState("All");
  const [announcementPriority, setAnnouncementPriority] = useState("All");
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState("");
  const [placements, setPlacements] = useState([]);
  const [placementDraft, setPlacementDraft] = useState(createPlacementDraft);
  const [placementSearch, setPlacementSearch] = useState("");
  const [placementBranch, setPlacementBranch] = useState("All");
  const [placementStatus, setPlacementStatus] = useState("All");
  const [isLoadingPlacements, setIsLoadingPlacements] = useState(false);
  const [isSavingPlacement, setIsSavingPlacement] = useState(false);
  const [placementError, setPlacementError] = useState("");
  const [placementMessage, setPlacementMessage] = useState("");
  const [deletingPlacementId, setDeletingPlacementId] = useState("");

  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const branchStudentCounts = students.reduce((counts, student) => {
    counts[student.branch] = (counts[student.branch] || 0) + 1;
    return counts;
  }, {});
  const branches = useMemo(() => {
    const discoveredBranches = [
      ...students.map((student) => student.branch),
      ...hods.map((hod) => hod.department),
      ...placements.map((placement) => placement.branch),
    ]
      .filter((branch) => typeof branch === "string" && branch.trim())
      .map((branch) => branch.trim())
      .filter((branch) => !BRANCHES.includes(branch));

    return [...BRANCHES, ...[...new Set(discoveredBranches)].sort()];
  }, [hods, placements, students]);

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase().trim();

    return students.filter((student) => {
      const branchMatch =
        selectedBranch === "All" ||
        student.branch === selectedBranch;

      const searchMatch =
        !query ||
        student.name?.toLowerCase().includes(query) ||
        student.branch?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query);

      return branchMatch && searchMatch;
    });
  }, [selectedBranch, studentSearch, students]);

  const filteredFaculty = useMemo(() => {
    const query = facultySearch.toLowerCase().trim();

    return faculty.filter((member) => {
      return (
        !query ||
        member.name?.toLowerCase().includes(query) ||
        member.department?.toLowerCase().includes(query) ||
        member.facultyId?.toLowerCase().includes(query)
      );
    });
  }, [faculty, facultySearch]);

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
        `${announcement.title} ${announcement.message} ${announcement.targetRole} ${announcement.targetDepartment || ""} ${announcement.category}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [announcements, announcementCategory, announcementPriority, announcementSearch]);

  const announcementDepartments = useMemo(
    () =>
      [...new Set([
        ...hods.map((hod) => hod.department),
        ...faculty.map((member) => member.department),
        ...students.map((student) => student.branch),
      ].filter(Boolean))].sort(),
    [faculty, hods, students]
  );
  const announcementBranches = useMemo(
    () =>
      [...new Set([
        ...students.map((student) => student.branch),
        ...faculty.map((member) => member.branch),
      ].filter(Boolean))].sort(),
    [faculty, students]
  );
  const announcementSections = useMemo(
    () =>
      [...new Set(
        students
          .filter((student) =>
            !announcementDraft.targetBranch ||
            student.branch === announcementDraft.targetBranch
          )
          .map((student) => student.section)
          .filter(Boolean)
      )].sort(),
    [announcementDraft.targetBranch, students]
  );

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

  useEffect(() => {
    if (!loggedIn) return undefined;

    let cancelled = false;
    setIsLoadingRequests(true);
    setIsLoadingDirectories(true);
    setRequestError("");
    setDirectoryError("");

    Promise.all([
      roleApprovalApi.directory("students"),
      roleApprovalApi.directory("faculty"),
      roleApprovalApi.directory("hod"),
    ])
      .then(([studentResult, facultyResult, hodResult]) => {
        if (!cancelled) {
          setStudents(studentResult.students || []);
          setFaculty(facultyResult.faculty || []);
          setHods(hodResult.hods || []);
        }
      })
      .catch((error) => {
        if (!cancelled) setDirectoryError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDirectories(false);
      });

    roleApprovalApi.list("hod")
      .then((result) => {
        if (!cancelled) {
          setRequests(
            (result.requests || []).map((request) => ({
              id: request._id,
              title: request.name,
              from: request.department,
              type: `HOD ID: ${request.hodId}`,
              email: request.email,
              status: "Pending",
            }))
          );
        }
      })
      .catch((error) => {
        if (!cancelled) setRequestError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRequests(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn || activeSection !== "Announcements") return undefined;

    let cancelled = false;
    let requestId = 0;
    let hasLoaded = false;
    const refreshAnnouncements = async () => {
      const currentRequestId = ++requestId;
      if (!hasLoaded) setIsLoadingAnnouncements(true);
      try {
        const items = await announcementsApi.getAll();
        if (!cancelled && currentRequestId === requestId) {
          setAnnouncements(items);
          setAnnouncementError("");
        }
      } catch (error) {
        if (!cancelled && currentRequestId === requestId) {
          setAnnouncementError(error.message || "Unable to load announcements.");
        }
      } finally {
        if (!cancelled && currentRequestId === requestId) {
          hasLoaded = true;
          setIsLoadingAnnouncements(false);
        }
      }
    };

    const unsubscribe = announcementsApi.subscribeToAnnouncementUpdates(
      () => refreshAnnouncements(),
      () => {
        if (!cancelled) {
          setAnnouncementError("Live updates are unavailable. Refresh to check for new announcements.");
        }
      }
    );
    void refreshAnnouncements();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeSection, loggedIn]);

  useEffect(() => {
    if (!loggedIn || activeSection !== "Placements") return undefined;

    let cancelled = false;
    setIsLoadingPlacements(true);
    setPlacementError("");
    placementsApi.getAll()
      .then((items) => {
        if (!cancelled) setPlacements(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setPlacementError(error.message || "Unable to load placements.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPlacements(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSection, loggedIn]);

  useEffect(() => {
    if (!loggedIn || activeSection !== "Events") return undefined;

    let cancelled = false;
    setIsLoadingEvents(true);
    setEventError("");
    eventsApi.getAll()
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setEventError(error.message || "Unable to load events.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEvents(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSection, loggedIn]);

  useEffect(() => {
    if (!loggedIn || activeSection !== "Achievements / Gallery") return undefined;

    let cancelled = false;
    setIsLoadingAchievementPosts(true);
    setAchievementError("");
    galleryApi.getAll()
      .then((items) => {
        if (!cancelled) setAchievementPosts(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setAchievementError(error.message || "Unable to load gallery posts.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAchievementPosts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSection, loggedIn]);

  useEffect(() => {
    if (!loggedIn) return undefined;

    let cancelled = false;
    setIsLoadingNotifications(true);
    setNotificationError("");
    notificationsApi.getMine()
      .then((items) => {
        if (!cancelled) setNotifications(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setNotificationError(error.message || "Unable to load notifications.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingNotifications(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!adminId.trim() || !password || isAuthenticating) return;

    setIsAuthenticating(true);
    setLoginError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminId.trim(),
          password,
          role: "admin",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token) {
        throw new Error(result.message || "Invalid Admin ID or password.");
      }

      storeAuthSession(result, "admin");
      setAdminUser(result.user);
      setAdminNameDraft(result.user.name || result.user.username || "");
      setLoggedIn(true);
      setLoginError("");
    } catch (error) {
      setLoginError(error.message || "Unable to sign in as Admin.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setAdminUser(null);
    setAdminId("");
    setPassword("");
    setLoginError("");
    clearAuthSession();
    setRequests([]);
    setStudents([]);
    setFaculty([]);
    setHods([]);
    setActiveSection("Dashboard");
    sectionHistory.current = [];
    setHasSectionHistory(false);
    setSelectedBranch("All");
    setShowNotifications(false);
    setAdminProfileMessage("");
  };

  const handleSaveAdminName = async (event) => {
    event.preventDefault();
    const name = adminNameDraft.trim();
    if (name.length < 2 || name.length > 100) {
      setAdminProfileMessage("Enter a display name between 2 and 100 characters.");
      return;
    }

    const token = sessionStorage.getItem("edulentraToken");
    if (!token) {
      setAdminProfileMessage("Your Admin session has expired. Please sign in again.");
      return;
    }

    setIsSavingAdminName(true);
    setAdminProfileMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Unable to save your display name.");
      }

      const updatedUser = updateAuthUser({ name: result.name || name });
      setAdminUser(updatedUser);
      setAdminNameDraft(updatedUser.name);
      setAdminProfileMessage("Display name updated.");
    } catch (error) {
      setAdminProfileMessage(error.message || "Unable to save your display name.");
    } finally {
      setIsSavingAdminName(false);
    }
  };

  const openSection = (section) => {
    if (section !== activeSection) {
      sectionHistory.current.push(activeSection);
      setHasSectionHistory(true);
    }
    setActiveSection(section);
    setShowNotifications(false);
  };

  const handleSectionBack = () => {
    const previousSection = sectionHistory.current.pop() || "Dashboard";
    setHasSectionHistory(sectionHistory.current.length > 0);
    setActiveSection(previousSection);
  };

  const decideHODRequest = async (requestId, decision) => {
    setReviewingRequestId(requestId);
    setRequestError("");
    setRequestMessage("");
    try {
      const result = await roleApprovalApi.decide("hod", requestId, decision);
      setRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== requestId)
      );
      if (decision === "APPROVED" && result.hod) {
        setHods((currentHods) => [
          { ...result.hod, _id: result.hod.id },
          ...currentHods,
        ]);
      }
      setRequestMessage(result.message);
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setReviewingRequestId("");
    }
  };

  const markAllNotificationsRead = async () => {
    if (isMarkingNotificationsRead || unreadNotifications === 0) return;
    setIsMarkingNotificationsRead(true);
    setNotificationError("");
    try {
      await notificationsApi.markAllRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      setNotificationError(error.message || "Unable to update notifications.");
    } finally {
      setIsMarkingNotificationsRead(false);
    }
  };

  const addAchievementPost = async (event) => {
    event.preventDefault();
    if (
      !achievementDraft.title.trim() ||
      !achievementDraft.description.trim() ||
      isSavingAchievement
    ) return;

    setIsSavingAchievement(true);
    setAchievementError("");
    setAchievementMessage("");
    try {
      const post = await galleryApi.create({
        ...achievementDraft,
        title: achievementDraft.title.trim(),
        description: achievementDraft.description.trim(),
      });
      setAchievementPosts((currentPosts) => [post, ...currentPosts]);
      setAchievementDraft(createAchievementDraft());
      setAchievementMessage("Gallery post published.");
    } catch (error) {
      setAchievementError(error.message || "Unable to publish this gallery post.");
    } finally {
      setIsSavingAchievement(false);
    }
  };

  const deleteAchievementPost = async (id) => {
    setDeletingAchievementId(id);
    setAchievementError("");
    setAchievementMessage("");
    try {
      await galleryApi.remove(id);
      setAchievementPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== id)
      );
      setAchievementMessage("Gallery post removed.");
    } catch (error) {
      setAchievementError(error.message || "Unable to remove this gallery post.");
    } finally {
      setDeletingAchievementId("");
    }
  };

  const addEvent = async (event) => {
    event.preventDefault();
    if (
      !eventDraft.title.trim() ||
      !eventDraft.location.trim() ||
      !eventDraft.description.trim() ||
      isSavingEvent
    ) return;

    setIsSavingEvent(true);
    setEventError("");
    setEventMessage("");
    try {
      const savedEvent = await eventsApi.create({
        ...eventDraft,
        title: eventDraft.title.trim(),
        location: eventDraft.location.trim(),
        description: eventDraft.description.trim(),
      });
      setEvents((currentEvents) => [savedEvent, ...currentEvents]);
      setEventDraft(createEventDraft());
      setEventMessage("Event published.");
    } catch (error) {
      setEventError(error.message || "Unable to publish this event.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  const deleteEvent = async (id) => {
    setDeletingEventId(id);
    setEventError("");
    setEventMessage("");
    try {
      await eventsApi.remove(id);
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
      setEventMessage("Event removed.");
    } catch (error) {
      setEventError(error.message || "Unable to remove this event.");
    } finally {
      setDeletingEventId("");
    }
  };

  const addAnnouncement = async (event) => {
    event.preventDefault();
    if (
      !announcementDraft.title.trim() ||
      !announcementDraft.message.trim() ||
      isSavingAnnouncement
    ) return;

    setIsSavingAnnouncement(true);
    setAnnouncementError("");
    setAnnouncementMessage("");
    try {
      const values = {
        ...announcementDraft,
        title: announcementDraft.title.trim(),
        message: announcementDraft.message.trim(),
      };
      const announcement = editingAnnouncementId
        ? await announcementsApi.update(editingAnnouncementId, values)
        : await announcementsApi.create(values);
      setAnnouncements((current) =>
        editingAnnouncementId
          ? current.map((item) => item.id === editingAnnouncementId ? announcement : item)
          : [announcement, ...current]
      );
      setEditingAnnouncementId("");
      setAnnouncementDraft(createAnnouncementDraft());
      setAnnouncementMessage(
        editingAnnouncementId
          ? "Announcement updated."
          : "Announcement published for the selected audience."
      );
    } catch (error) {
      setAnnouncementError(error.message || "Unable to publish announcement.");
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (deletingAnnouncementId) return;
    setAnnouncementError("");
    setAnnouncementMessage("");
    setDeletingAnnouncementId(id);
    try {
      await announcementsApi.remove(id);
      setAnnouncements((current) =>
        current.filter((announcement) => announcement.id !== id)
      );
    } catch (error) {
      setAnnouncementError(error.message || "Unable to delete announcement.");
    } finally {
      setDeletingAnnouncementId("");
    }
  };

  const toggleAnnouncementPublication = async (announcement) => {
    setAnnouncementError("");
    setAnnouncementMessage("");
    try {
      const updated = await announcementsApi.update(announcement.id, {
        ...announcement,
        publishAt: toLocalDateTime(announcement.publishAt),
        expiresAt: toLocalDateTime(announcement.expiresAt),
        isActive: !announcement.isActive,
      });
      setAnnouncements((current) =>
        current.map((item) => item.id === announcement.id ? updated : item)
      );
    } catch (error) {
      setAnnouncementError(error.message || "Unable to change publication status.");
    }
  };

  const editAnnouncement = (announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementDraft({
      title: announcement.title,
      category: announcement.category || "General",
      priority: announcement.priority || "Normal",
      targetRole: announcement.targetRole || "ALL",
      targetDepartment: announcement.targetDepartment || "",
      targetBranch: announcement.targetBranch || "",
      targetSection: announcement.targetSection || "",
      date: announcement.date || new Date().toISOString().slice(0, 10),
      publishAt: toLocalDateTime(announcement.publishAt),
      expiresAt: toLocalDateTime(announcement.expiresAt),
      isActive: announcement.isActive !== false,
      message: announcement.message,
    });
    setAnnouncementError("");
    setAnnouncementMessage("");
  };

  const addPlacement = async (event) => {
    event.preventDefault();
    if (
      !placementDraft.company.trim() ||
      !placementDraft.role.trim() ||
      !placementDraft.location.trim() ||
      !placementDraft.description.trim()
    ) {
      setPlacementError("Complete all required placement details.");
      return;
    }

    setIsSavingPlacement(true);
    setPlacementError("");
    setPlacementMessage("");
    try {
      const placement = await placementsApi.create(placementDraft);
      setPlacements((items) => [placement, ...items]);
      setPlacementDraft(createPlacementDraft());
      setPlacementMessage("Placement published successfully.");
    } catch (error) {
      setPlacementError(error.message || "Unable to publish placement.");
    } finally {
      setIsSavingPlacement(false);
    }
  };

  const deletePlacement = async (id) => {
    setDeletingPlacementId(id);
    setPlacementError("");
    setPlacementMessage("");
    try {
      await placementsApi.remove(id);
      setPlacements((items) => items.filter((placement) => placement.id !== id));
      setPlacementMessage("Placement removed.");
    } catch (error) {
      setPlacementError(error.message || "Unable to remove placement.");
    } finally {
      setDeletingPlacementId("");
    }
  };

  /* =========================
     ADMIN LOGIN
  ========================= */

  if (!loggedIn) {
    return (
      <section className="admin-login-page">
        <PortalBackButton role="admin" fallbackTo="/role" />
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

                <Link
                  className="password-recovery-link"
                  to="/forgot-password?role=admin"
                >
                  Forgot Password?
                </Link>

                <button type="submit" disabled={isAuthenticating}>
                  {isAuthenticating ? "Signing in..." : "Login"}
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
          icon="👨‍🎓"
          title="Total Students"
          value={totalStudents}
        />

        <StatCard
          icon="👩‍🏫"
          title="Total Faculty"
          value={`${totalFaculty}+`}
        />

        <StatCard
          icon="🏢"
          title="Departments"
          value={BRANCHES.length}
        />

        <StatCard
          icon="📩"
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

            {branches.map((branch) => (
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
          {branches.map((branch) => (
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
                openSection("Students");
              }}
            >
              <span>{branch}</span>

              <strong>
                {branchStudentCounts[branch] || 0}
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
              onClick={() => openSection("Requests")}
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

        {branches.map((branch) => (
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
        {directoryError && <p role="alert" className="login-error">{directoryError}</p>}
        {isLoadingDirectories && <p>Loading student accounts...</p>}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Branch</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id}>
                <td>
                  {student.name}
                </td>

                <td>
                  {student.rollNumber}
                </td>

                <td>
                  {student.branch}{student.section ? ` · ${student.section}` : ""}
                </td>

                <td>
                  <span className="status approved">
                    Active
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
        {directoryError && <p role="alert" className="login-error">{directoryError}</p>}
        {isLoadingDirectories && <p>Loading faculty accounts...</p>}
        <table>
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Subject</th>
            </tr>
          </thead>

          <tbody>
            {filteredFaculty.map((member) => (
              <tr key={member._id}>
                <td>
                  {member.facultyId}
                </td>

                <td>
                  {member.name}
                </td>

                <td>
                  {member.department}
                </td>

                <td>
                  {member.subject}
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
        {directoryError && <p role="alert" className="login-error">{directoryError}</p>}
        {isLoadingDirectories && <p>Loading HOD accounts...</p>}
        {hods.map((hod) => (
          <div
            className="department-row"
            key={hod._id}
          >
            <div className="department-badge">
              {hod.department}
            </div>

            <div>
              <strong>
                {hod.department} Department
              </strong>

              <span>
                {hod.name} · HOD ID: {hod.hodId}
              </span>
            </div>
          </div>
        ))}
        {!isLoadingDirectories && !directoryError && hods.length === 0 && (
          <p>No approved HOD accounts are available.</p>
        )}
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

      {requestError && <p role="alert" className="login-error">{requestError}</p>}
      {requestMessage && <p role="status">{requestMessage}</p>}

      {isLoadingRequests ? (
        <p>Loading pending HOD registrations...</p>
      ) : requests.length === 0 ? (
        <p>No pending HOD registration requests.</p>
      ) : requests.map((request) => (
        <div
          className="request-card"
          key={request.id}
        >
          <div>
            <h3>
              HOD registration: {request.title}
            </h3>

            <p>
              {request.from} · {request.type} · {request.email}
            </p>
          </div>

          <div className="request-actions">
            <span
              className={`status ${request.status.toLowerCase()}`}
            >
              {request.status}
            </span>

            {request.status === "Pending" && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    decideHODRequest(request.id, "APPROVED")
                  }
                  disabled={Boolean(reviewingRequestId)}
                >
                  {reviewingRequestId === request.id ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => decideHODRequest(request.id, "REJECTED")}
                  disabled={Boolean(reviewingRequestId)}
                >
                  Reject
                </button>
              </div>
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
          disabled={isMarkingNotificationsRead || unreadNotifications === 0}
        >
          {isMarkingNotificationsRead ? "Saving..." : "Mark all read"}
        </button>
      </div>

      {notificationError && <p role="alert">{notificationError}</p>}
      {isLoadingNotifications ? (
        <p role="status">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No pending HOD approval notifications.</p>
      ) : notifications.map((notification) => (
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

          <button
            type="button"
            className="text-button"
            onClick={() => openSection("Requests")}
          >
            Review request
          </button>

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
        {adminDisplayName.charAt(0).toUpperCase()}
      </div>

      <h2>
        {adminDisplayName}
      </h2>

      <p>
        Admin account
      </p>

      {adminProfileMessage && (
        <p role={adminProfileMessage.endsWith(".") && adminProfileMessage !== "Display name updated."
          ? "alert"
          : "status"}
        >
          {adminProfileMessage}
        </p>
      )}

      <form onSubmit={handleSaveAdminName}>
        <label htmlFor="admin-display-name">Display name</label>
        <input
          id="admin-display-name"
          type="text"
          value={adminNameDraft}
          onChange={(event) => setAdminNameDraft(event.target.value)}
          maxLength={100}
          required
        />
        <button type="submit" disabled={isSavingAdminName}>
          {isSavingAdminName ? "Saving..." : "Save name"}
        </button>
      </form>

      <div className="profile-details">
        <div>
          <span>
            Admin ID
          </span>

          <strong>
            {adminUser?.username || adminId || "Not provided"}
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
        {achievementError && <p role="alert">{achievementError}</p>}
        {achievementMessage && <p role="status">{achievementMessage}</p>}
        <button className="admin-submit-button" type="submit" disabled={isSavingAchievement}>
          {isSavingAchievement ? "Publishing..." : "Publish post"}
        </button>
      </form>

      <div className="admin-entry-grid">
        {isLoadingAchievementPosts ? (
          <p role="status">Loading gallery posts...</p>
        ) : filteredAchievementPosts.map((post) => (
          <article className="admin-entry-card" key={post.id}>
            {post.imageUrl && <img src={post.imageUrl} alt="" className="admin-entry-image" />}
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{post.category}</span><time dateTime={post.date}>{post.date}</time></div>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <button
                type="button"
                className="admin-delete-button"
                onClick={() => deleteAchievementPost(post.id)}
                disabled={deletingAchievementId === post.id}
              >
                {deletingAchievementId === post.id ? "Removing..." : "Delete post"}
              </button>
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
        {eventError && <p role="alert">{eventError}</p>}
        {eventMessage && <p role="status">{eventMessage}</p>}
        <button className="admin-submit-button" type="submit" disabled={isSavingEvent}>
          {isSavingEvent ? "Publishing..." : "Add event"}
        </button>
      </form>

      <div className="admin-entry-grid">
        {isLoadingEvents ? (
          <p role="status">Loading events...</p>
        ) : filteredEvents.map((event) => (
          <article className="admin-entry-card" key={event.id}>
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{event.category}</span><time dateTime={event.date}>{event.date}</time></div>
              <h3>{event.title}</h3>
              <p className="admin-event-location">{event.location}</p>
              <p>{event.description}</p>
              <button
                type="button"
                className="admin-delete-button"
                onClick={() => deleteEvent(event.id)}
                disabled={deletingEventId === event.id}
              >
                {deletingEventId === event.id ? "Removing..." : "Delete event"}
              </button>
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
          <p>Publish announcements to all users or a specific account role.</p>
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
        <h3>{editingAnnouncementId ? "Edit announcement" : "New announcement"}</h3>
        <div className="admin-entry-fields">
          <input aria-label="Announcement title" placeholder="Announcement title" value={announcementDraft.title} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, title: event.target.value })} required />
          <select aria-label="Announcement category" value={announcementDraft.category} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, category: event.target.value })}>
            {announcementCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select aria-label="Announcement priority" value={announcementDraft.priority} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, priority: event.target.value })}>
            {announcementPriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <select aria-label="Announcement audience" value={announcementDraft.targetRole} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, targetRole: event.target.value })}>
            <option value="ALL">Everyone</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="HOD">HODs</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select
            aria-label="Announcement department"
            value={announcementDraft.targetDepartment}
            onChange={(event) => setAnnouncementDraft({ ...announcementDraft, targetDepartment: event.target.value })}
          >
            <option value="">All departments</option>
            {announcementDepartments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          {(announcementDraft.targetRole === "ALL" ||
            announcementDraft.targetRole === "STUDENT" ||
            announcementDraft.targetRole === "FACULTY") && (
            <select
              aria-label="Announcement branch"
              value={announcementDraft.targetBranch}
              onChange={(event) => setAnnouncementDraft({ ...announcementDraft, targetBranch: event.target.value, targetSection: "" })}
            >
              <option value="">All branches</option>
              {announcementBranches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          )}
          {(announcementDraft.targetRole === "ALL" ||
            announcementDraft.targetRole === "STUDENT") && (
            <select
              aria-label="Announcement section"
              value={announcementDraft.targetSection}
              onChange={(event) => setAnnouncementDraft({ ...announcementDraft, targetSection: event.target.value })}
            >
              <option value="">All sections</option>
              {announcementSections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          )}
          <input aria-label="Announcement date" type="date" value={announcementDraft.date} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, date: event.target.value })} required />
          <label>
            Publish at (optional)
            <input
              aria-label="Announcement publish at"
              type="datetime-local"
              value={announcementDraft.publishAt}
              onChange={(event) => setAnnouncementDraft({ ...announcementDraft, publishAt: event.target.value })}
            />
          </label>
          <label>
            Expires at (optional)
            <input
              aria-label="Announcement expires at"
              type="datetime-local"
              min={announcementDraft.publishAt || undefined}
              value={announcementDraft.expiresAt}
              onChange={(event) => setAnnouncementDraft({ ...announcementDraft, expiresAt: event.target.value })}
            />
          </label>
          <select
            aria-label="Announcement publication state"
            value={announcementDraft.isActive ? "published" : "draft"}
            onChange={(event) => setAnnouncementDraft({ ...announcementDraft, isActive: event.target.value === "published" })}
          >
            <option value="published">Published (or schedule it)</option>
            <option value="draft">Draft / unpublished</option>
          </select>
          <textarea aria-label="Announcement message" placeholder="Announcement details" value={announcementDraft.message} onChange={(event) => setAnnouncementDraft({ ...announcementDraft, message: event.target.value })} required />
        </div>
        <button className="admin-submit-button" type="submit" disabled={isSavingAnnouncement}>
          {isSavingAnnouncement ? "Saving..." : editingAnnouncementId ? "Save changes" : "Save announcement"}
        </button>
        {editingAnnouncementId && (
          <button
            className="admin-delete-button"
            type="button"
            onClick={() => {
              setEditingAnnouncementId("");
              setAnnouncementDraft(createAnnouncementDraft());
            }}
          >
            Cancel editing
          </button>
        )}
      </form>

      {announcementError && <p className="admin-empty-state" role="alert">{announcementError}</p>}
      {announcementMessage && <p className="admin-empty-state" role="status">{announcementMessage}</p>}
      <div className="admin-entry-grid">
        {isLoadingAnnouncements ? (
          <p className="admin-empty-state">Loading announcements...</p>
        ) : filteredAnnouncements.map((announcement) => (
          <article className="admin-entry-card" key={announcement.id}>
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta">
                <span>{announcement.category}</span>
                <span>{announcement.priority}</span>
                <span>{!announcement.isActive ? "Draft / unpublished" : announcement.publishAt && new Date(announcement.publishAt) > new Date() ? "Scheduled" : announcement.expiresAt && new Date(announcement.expiresAt) <= new Date() ? "Expired" : "Published"}</span>
                <time dateTime={announcement.date}>{announcement.date}</time>
              </div>
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              <p className="admin-event-location">Audience: {announcementAudienceLabel(announcement)}</p>
              <button type="button" className="admin-submit-button" onClick={() => editAnnouncement(announcement)}>Edit announcement</button>
              <button type="button" className="admin-submit-button" onClick={() => toggleAnnouncementPublication(announcement)}>
                {announcement.isActive ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="admin-delete-button" disabled={deletingAnnouncementId === announcement.id} onClick={() => deleteAnnouncement(announcement.id)}>
                {deletingAnnouncementId === announcement.id ? "Deleting..." : "Delete announcement"}
              </button>
            </div>
          </article>
        ))}
        {!isLoadingAnnouncements && !announcementError && filteredAnnouncements.length === 0 && <p className="admin-empty-state">No announcements match your search or filters.</p>}
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
            {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
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
            {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <input aria-label="Placement location" placeholder="Location" value={placementDraft.location} onChange={(event) => setPlacementDraft({ ...placementDraft, location: event.target.value })} required />
          <input aria-label="Package" placeholder="Package (optional)" value={placementDraft.package} onChange={(event) => setPlacementDraft({ ...placementDraft, package: event.target.value })} />
          <input aria-label="Application deadline" type="date" value={placementDraft.deadline} onChange={(event) => setPlacementDraft({ ...placementDraft, deadline: event.target.value })} required />
          <input aria-label="Eligibility criteria" placeholder="Eligibility criteria (optional)" value={placementDraft.eligibility} onChange={(event) => setPlacementDraft({ ...placementDraft, eligibility: event.target.value })} />
          <input aria-label="Application link" type="url" placeholder="Application link (optional)" value={placementDraft.applyLink} onChange={(event) => setPlacementDraft({ ...placementDraft, applyLink: event.target.value })} />
          <textarea aria-label="Placement details" placeholder="Role and application details" value={placementDraft.description} onChange={(event) => setPlacementDraft({ ...placementDraft, description: event.target.value })} required />
        </div>
        {placementError && <p role="alert">{placementError}</p>}
        {placementMessage && <p role="status">{placementMessage}</p>}
        <button className="admin-submit-button" type="submit" disabled={isSavingPlacement}>
          {isSavingPlacement ? "Publishing..." : "Publish placement"}
        </button>
      </form>

      <div className="admin-entry-grid">
        {isLoadingPlacements ? (
          <p className="admin-empty-state">Loading placements...</p>
        ) : filteredPlacements.map((placement) => (
          <article className="admin-entry-card" key={placement.id}>
            <div className="admin-entry-card-content">
              <div className="admin-entry-meta"><span>{placement.branch}</span><time dateTime={placement.deadline}>Apply by {placement.deadline}</time></div>
              <h3>{placement.company}</h3>
              <p className="admin-event-location">{placement.role} · {placement.location}{placement.package ? ` · ${placement.package}` : ""}</p>
              <p>{placement.description}</p>
              {placement.eligibility && <p>Eligibility: {placement.eligibility}</p>}
              {placement.applyLink && <a href={placement.applyLink} target="_blank" rel="noreferrer">Application link</a>}
              <button type="button" className="admin-delete-button" disabled={deletingPlacementId === placement.id} onClick={() => deletePlacement(placement.id)}>
                {deletingPlacementId === placement.id ? "Removing..." : "Delete placement"}
              </button>
            </div>
          </article>
        ))}
        {!isLoadingPlacements && !placementError && filteredPlacements.length === 0 && <p className="admin-empty-state">No placements match your search or filters.</p>}
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
              {getGreeting()}, {adminDisplayName}{" "}
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
                  🔔
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
                      disabled={isMarkingNotificationsRead || unreadNotifications === 0}
                    >
                      {isMarkingNotificationsRead ? "Saving..." : "Mark read"}
                    </button>
                  </div>

                  {notificationError && <p role="alert">{notificationError}</p>}
                  {isLoadingNotifications ? (
                    <p role="status">Loading notifications...</p>
                  ) : notifications.length === 0 ? (
                    <p>No pending HOD requests.</p>
                  ) : notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={
                          !notification.read
                            ? "unread"
                            : ""
                        }
                        onClick={() => {
                          setShowNotifications(false);
                          openSection("Requests");
                        }}
                      >
                        {notification.text}
                      </button>
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
                {adminDisplayName.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </header>

        <PortalBackButton
           show={activeSection !== "Dashboard" || hasSectionHistory}
           onBack={handleSectionBack}
        />

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