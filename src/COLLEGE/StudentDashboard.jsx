import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../api/authSession";
import { announcementsApi } from "../api/announcementsApi";
import { complaintsApi } from "../api/complaintsApi";
import { outpassesApi } from "../api/outpassesApi";
import { suggestionsApi } from "../api/suggestionsApi";
import { studentApi } from "../api/studentApi";
import { attendanceApi } from "../api/attendanceApi";
import { assignmentsApi } from "../api/assignmentsApi";
import { studyMaterialsApi } from "../api/studyMaterialsApi";
import { placementsApi } from "../api/placementsApi";
import { eventsApi } from "../api/eventsApi";
import { galleryApi } from "../api/galleryApi";
import { studentTasksApi } from "../api/studentTasksApi";
import "./StudentDashboard.css";
import PortalBackButton from "./PortalBackButton";


/* =========================================================
   COLLEGE TIMETABLE
========================================================= */

const timetableData = {
    Monday: [
        {
            period: "1",
            time: "9:00 AM – 10:00 AM",
            subject: "SSP",
            type: "Class"
        },
        {
            period: "2",
            time: "10:00 AM – 11:00 AM",
            subject: "NLP",
            type: "Class"
        },
        {
            period: "3",
            time: "11:20 AM – 12:20 PM",
            subject: "IQTA",
            type: "Class"
        },
        {
            period: "4",
            time: "12:20 PM – 1:20 PM",
            subject: "NLP",
            type: "Class"
        },
        {
            period: "5",
            time: "2:00 PM – 3:00 PM",
            subject: "CV & IP",
            type: "Class"
        },
        {
            period: "6",
            time: "3:00 PM – 4:00 PM",
            subject: "DV",
            type: "Class"
        }
    ],

    Tuesday: [
        {
            period: "1",
            time: "9:00 AM – 10:00 AM",
            subject: "SSP",
            type: "Class"
        },
        {
            period: "2",
            time: "10:00 AM – 11:00 AM",
            subject: "DV",
            type: "Class"
        },
        {
            period: "3–4",
            time: "11:20 AM – 1:20 PM",
            subject: "AI & SP LAB",
            type: "Lab"
        },
        {
            period: "5",
            time: "2:00 PM – 3:00 PM",
            subject: "NLP",
            type: "Class"
        },
        {
            period: "6",
            time: "3:00 PM – 4:00 PM",
            subject: "IQTA",
            type: "Class"
        }
    ],

    Wednesday: [
        {
            period: "1",
            time: "9:00 AM – 10:00 AM",
            subject: "IQTA",
            type: "Class"
        },
        {
            period: "2",
            time: "10:00 AM – 11:00 AM",
            subject: "CV & IP",
            type: "Class"
        },
        {
            period: "3–4",
            time: "11:20 AM – 1:20 PM",
            subject: "TINKERING LAB",
            type: "Lab"
        },
        {
            period: "5",
            time: "2:00 PM – 3:00 PM",
            subject: "SSP",
            type: "Class"
        },
        {
            period: "6",
            time: "3:00 PM – 4:00 PM",
            subject: "NLP",
            type: "Class"
        }
    ],

    Thursday: [
        {
            period: "1",
            time: "9:00 AM – 10:00 AM",
            subject: "DV",
            type: "Class"
        },
        {
            period: "2",
            time: "10:00 AM – 11:00 AM",
            subject: "SSP",
            type: "Class"
        },
        {
            period: "3–4",
            time: "11:20 AM – 1:20 PM",
            subject: "CV & NLP LAB",
            type: "Lab"
        },
        {
            period: "5",
            time: "2:00 PM – 3:00 PM",
            subject: "CV & IP",
            type: "Class"
        },
        {
            period: "6",
            time: "3:00 PM – 4:00 PM",
            subject: "IQTA",
            type: "Class"
        }
    ],

    Friday: [
        {
            period: "1",
            time: "9:00 AM – 10:00 AM",
            subject: "DV",
            type: "Class"
        },
        {
            period: "2",
            time: "10:00 AM – 11:00 AM",
            subject: "NLP",
            type: "Class"
        },
        {
            period: "3",
            time: "11:20 AM – 12:20 PM",
            subject: "DV",
            type: "Class"
        },
        {
            period: "4",
            time: "12:20 PM – 1:20 PM",
            subject: "IQTA",
            type: "Class"
        },
        {
            period: "5",
            time: "2:00 PM – 3:00 PM",
            subject: "APT",
            type: "Class"
        },
        {
            period: "6",
            time: "3:00 PM – 4:00 PM",
            subject: "CV & IP",
            type: "Class"
        }
    ],

    Saturday: [
        {
            period: "1–2",
            time: "9:00 AM – 11:00 AM",
            subject: "FSD-II LAB",
            type: "Lab"
        },
        {
            period: "3",
            time: "11:20 AM – 12:20 PM",
            subject: "SSP",
            type: "Class"
        },
        {
            period: "4",
            time: "12:20 PM – 1:20 PM",
            subject: "CV & IP",
            type: "Class"
        },
        {
            period: "5",
            time: "2:00 PM – 3:00 PM",
            subject: "APT",
            type: "Class"
        },
        {
            period: "6",
            time: "3:00 PM – 4:00 PM",
            subject: "APT",
            type: "Class"
        }
    ]
};


/* =========================================================
   DAYS
========================================================= */

const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];


/* =========================================================
   TASK CATEGORIES
========================================================= */

const taskCategories = [
    "Assignment",
    "Exam",
    "Study",
    "Personal",
    "Other"
];


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const formatDateKey = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const formatDisplayDate = (dateKey) => {
    const date = new Date(
        `${dateKey}T00:00:00`
    );

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );
};


function StudentDashboard() {
    const navigate = useNavigate();
    const handleLogout = () => {
        clearAuthSession();
        navigate("/student", { replace: true });
    };
    const sectionHistory = useRef([]);

    /* =====================================================
       GENERAL DASHBOARD STATE
    ===================================================== */

    const [activeSection, setActiveSection] =
        useState("dashboard");
    const [studentProfile, setStudentProfile] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("edulentraUser") || "null");
        } catch {
            return null;
        }
    });
    const [studentProfileError, setStudentProfileError] = useState("");
    const [studentAttendance, setStudentAttendance] = useState(null);
    const [studentAttendanceError, setStudentAttendanceError] = useState("");
    const [isLoadingStudentAttendance, setIsLoadingStudentAttendance] = useState(true);
    const [studentAssignments, setStudentAssignments] = useState([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [assignmentError, setAssignmentError] = useState("");
    const [assignmentSuccess, setAssignmentSuccess] = useState("");
    const [assignmentAnswers, setAssignmentAnswers] = useState({});
    const [assignmentAttachmentUrls, setAssignmentAttachmentUrls] = useState({});
    const [submittingAssignmentId, setSubmittingAssignmentId] = useState("");
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [isLoadingStudyMaterials, setIsLoadingStudyMaterials] = useState(false);
    const [studyMaterialsError, setStudyMaterialsError] = useState("");
    const [studentPlacements, setStudentPlacements] = useState([]);
    const [isLoadingPlacements, setIsLoadingPlacements] = useState(false);
    const [placementsError, setPlacementsError] = useState("");
    const [campusEvents, setCampusEvents] = useState([]);
    const [isLoadingCampusEvents, setIsLoadingCampusEvents] = useState(false);
    const [campusEventsError, setCampusEventsError] = useState("");
    const [galleryPosts, setGalleryPosts] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [galleryError, setGalleryError] = useState("");
    const [announcements, setAnnouncements] = useState([]);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
    const [announcementError, setAnnouncementError] = useState("");

    const [complaint, setComplaint] =
        useState("");
    const [complaintSubject, setComplaintSubject] = useState("");
    const [studentComplaints, setStudentComplaints] = useState([]);
    const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
    const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
    const [complaintError, setComplaintError] = useState("");
    const [complaintSuccess, setComplaintSuccess] = useState("");

    const [suggestion, setSuggestion] = useState("");
    const [studentSuggestions, setStudentSuggestions] = useState([]);
    const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
    const [suggestionError, setSuggestionError] = useState("");
    const [suggestionSuccess, setSuggestionSuccess] = useState("");

    const [outpassReason, setOutpassReason] = useState("");
    const [outpassDestination, setOutpassDestination] = useState("");
    const [outpassFromDate, setOutpassFromDate] = useState("");
    const [outpassToDate, setOutpassToDate] = useState("");
    const [outpassRequests, setOutpassRequests] = useState([]);
    const [isSubmittingOutpass, setIsSubmittingOutpass] = useState(false);
    const [outpassError, setOutpassError] = useState("");
    const [outpassSuccess, setOutpassSuccess] = useState("");


    /* =====================================================
       TIMETABLE STATE
    ===================================================== */

    const [selectedDay, setSelectedDay] =
        useState("Monday");


    /* =====================================================
       CALENDAR STATE
    ===================================================== */

    const today = useMemo(
        () => new Date(),
        []
    );

    const [calendarMonth, setCalendarMonth] =
        useState(
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            )
        );

    const [selectedDate, setSelectedDate] =
        useState(
            formatDateKey(today)
        );


    /* =====================================================
       TASK STATE
    ===================================================== */

    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [taskError, setTaskError] = useState("");
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [taskActionId, setTaskActionId] = useState("");


    /* =====================================================
       TASK FORM STATE
    ===================================================== */

    const [showTaskModal, setShowTaskModal] =
        useState(false);

    const [taskTitle, setTaskTitle] =
        useState("");

    const [taskCategory, setTaskCategory] =
        useState("Assignment");

    const [taskDate, setTaskDate] =
        useState(
            formatDateKey(today)
        );

    const [taskTime, setTaskTime] =
        useState("");

    const [taskDescription, setTaskDescription] =
        useState("");


    useEffect(() => {
        let cancelled = false;

        const loadTasks = async () => {
            setIsLoadingTasks(true);
            setTaskError("");
            try {
                const studentTasks = await studentTasksApi.getMine();
                if (!cancelled) setTasks(studentTasks);
            } catch (error) {
                if (!cancelled) {
                    setTaskError(error.message || "Unable to load your planner tasks.");
                }
            } finally {
                if (!cancelled) setIsLoadingTasks(false);
            }
        };

        loadTasks();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        let cancelled = false;
        studentApi.getProfile()
            .then((profile) => {
                if (!cancelled) {
                    setStudentProfile(profile);
                    setStudentProfileError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setStudentProfileError(error.message || "Unable to load your profile.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        attendanceApi.getMine()
            .then((result) => {
                if (!cancelled) {
                    setStudentAttendance(result);
                    setStudentAttendanceError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setStudentAttendanceError(error.message || "Unable to load attendance.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingStudentAttendance(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (activeSection !== "complaints") return undefined;

        let cancelled = false;
        setIsLoadingComplaints(true);
        complaintsApi.getMine()
            .then((items) => {
                if (!cancelled) {
                    setStudentComplaints(items);
                    setComplaintError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setComplaintError(error.message || "Unable to load your complaints.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingComplaints(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "outpass") return undefined;

        let cancelled = false;
        outpassesApi.getMine()
            .then((items) => {
                if (!cancelled) {
                    setOutpassRequests(items);
                    setOutpassError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setOutpassError(error.message || "Unable to load your outpass requests.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "suggestions") return undefined;

        let cancelled = false;
        suggestionsApi.getMine()
            .then((items) => {
                if (!cancelled) {
                    setStudentSuggestions(items);
                    setSuggestionError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setSuggestionError(error.message || "Unable to load your suggestions.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "assignments") return undefined;

        let cancelled = false;
        setIsLoadingAssignments(true);
        assignmentsApi.getMine()
            .then((items) => {
                if (!cancelled) {
                    setStudentAssignments(items);
                    setAssignmentAnswers(Object.fromEntries(
                        items.map((item) => [item.id, item.submission?.answer || ""])
                    ));
                    setAssignmentError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setAssignmentError(error.message || "Unable to load your assignments.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingAssignments(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "pdfs") return undefined;

        let cancelled = false;
        setIsLoadingStudyMaterials(true);
        studyMaterialsApi.getMine()
            .then((materials) => {
                if (!cancelled) {
                    setStudyMaterials(materials);
                    setStudyMaterialsError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setStudyMaterialsError(error.message || "Unable to load study materials.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingStudyMaterials(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "placements") return undefined;

        let cancelled = false;
        setIsLoadingPlacements(true);
        placementsApi.getAll()
            .then((items) => {
                if (!cancelled) {
                    setStudentPlacements(items);
                    setPlacementsError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setPlacementsError(error.message || "Unable to load placement opportunities.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingPlacements(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "events") return undefined;

        let cancelled = false;
        setIsLoadingCampusEvents(true);
        eventsApi.getAll()
            .then((items) => {
                if (!cancelled) {
                    setCampusEvents(items);
                    setCampusEventsError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setCampusEventsError(error.message || "Unable to load campus events.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingCampusEvents(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== "gallery") return undefined;

        let cancelled = false;
        setIsLoadingGallery(true);
        galleryApi.getAll()
            .then((posts) => {
                if (!cancelled) {
                    setGalleryPosts(posts);
                    setGalleryError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setGalleryError(error.message || "Unable to load gallery posts.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingGallery(false);
            });

        return () => {
            cancelled = true;
        };
    }, [activeSection]);


    /* =====================================================
       MENU
    ===================================================== */

    const handleMenuClick = (section) => {
        if (section === activeSection) {
            return;
        }
        sectionHistory.current.push(activeSection);
        setActiveSection(section);
    };

    const handleSectionBack = () => {
        if (activeSection !== "dashboard" || sectionHistory.current.length > 0) {
            const previousSection = sectionHistory.current.pop() || "dashboard";
            setActiveSection(previousSection);
            return true;
        }

        return false;
    };


    /* =====================================================
       COMPLAINT
    ===================================================== */

    const handleComplaint = async (e) => {
        e.preventDefault();
        if (!complaintSubject.trim() || !complaint.trim()) {
            setComplaintError("Enter a subject and details for your complaint.");
            return;
        }

        setIsSubmittingComplaint(true);
        setComplaintError("");
        setComplaintSuccess("");
        try {
            const savedComplaint = await complaintsApi.create({
                subject: complaintSubject.trim(),
                description: complaint.trim(),
            });
            setComplaintSubject("");
            setComplaint("");
            setComplaintSuccess("Your complaint has been submitted.");
            setStudentComplaints((items) => [savedComplaint, ...items]);
        } catch (error) {
            setComplaintError(error.message || "Unable to submit your complaint.");
        } finally {
            setIsSubmittingComplaint(false);
        }
    };


    /* =====================================================
       SUGGESTION
    ===================================================== */

    const handleSuggestion = async (e) => {
        e.preventDefault();
        if (suggestion.trim().length < 5) {
            setSuggestionError("Enter a suggestion with at least 5 characters.");
            return;
        }

        setIsSubmittingSuggestion(true);
        setSuggestionError("");
        setSuggestionSuccess("");
        try {
            const savedSuggestion = await suggestionsApi.create(suggestion.trim());
            setStudentSuggestions((items) => [savedSuggestion, ...items]);
            setSuggestion("");
            setSuggestionSuccess("Your suggestion has been submitted.");
        } catch (error) {
            setSuggestionError(error.message || "Unable to submit your suggestion.");
        } finally {
            setIsSubmittingSuggestion(false);
        }
    };


    /* =====================================================
       OUTPASS
    ===================================================== */

    const handleOutpass = async (e) => {

        e.preventDefault();

        if (!outpassReason.trim() || !outpassDestination.trim()) {
            setOutpassError("Enter a reason and destination for the outpass request.");
            return;
        }

        if (!outpassFromDate || !outpassToDate) {
            setOutpassError("Select both the from and to dates.");
            return;
        }

        const from = new Date(outpassFromDate);
        const to = new Date(outpassToDate);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
            setOutpassError("The outpass date range is invalid.");
            return;
        }

        setIsSubmittingOutpass(true);
        setOutpassError("");
        setOutpassSuccess("");

        try {
            const created = await outpassesApi.create({
                reason: outpassReason.trim(),
                destination: outpassDestination.trim(),
                fromDate: outpassFromDate,
                toDate: outpassToDate,
            });

            setOutpassReason("");
            setOutpassDestination("");
            setOutpassFromDate("");
            setOutpassToDate("");
            setOutpassSuccess("Your outpass request has been submitted.");
            setOutpassRequests((items) => [created, ...items]);
        } catch (error) {
            setOutpassError(error.message || "Unable to submit your outpass request.");
        } finally {
            setIsSubmittingOutpass(false);
        }

    };

    const handleAssignmentSubmit = async (event, assignmentId) => {
        event.preventDefault();
        const answer = assignmentAnswers[assignmentId]?.trim() || "";
        const fileUrl = assignmentAttachmentUrls[assignmentId]?.trim() || "";
        if (!answer) {
            setAssignmentError("Write your response before submitting.");
            return;
        }

        setSubmittingAssignmentId(assignmentId);
        setAssignmentError("");
        setAssignmentSuccess("");
        try {
            const result = await assignmentsApi.submit(assignmentId, answer, fileUrl);
            setStudentAssignments((items) => items.map((item) =>
                item.id === assignmentId
                    ? { ...item, submission: result.submission }
                    : item
            ));
            setAssignmentSuccess("Your assignment response has been submitted.");
        } catch (error) {
            setAssignmentError(error.message || "Unable to submit your assignment.");
        } finally {
            setSubmittingAssignmentId("");
        }
    };


    /* =====================================================
       CALENDAR MONTH
    ===================================================== */

    const monthName =
        calendarMonth.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    const changeMonth = (amount) => {

        setCalendarMonth(
            new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() + amount,
                1
            )
        );

    };


    const goToToday = () => {

        const currentDate =
            new Date();

        setCalendarMonth(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            )
        );

        setSelectedDate(
            formatDateKey(currentDate)
        );

    };


    /* =====================================================
       CREATE CALENDAR DAYS
    ===================================================== */

    const calendarDays = useMemo(() => {

        const year =
            calendarMonth.getFullYear();

        const month =
            calendarMonth.getMonth();

        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();

        const numberOfDays =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

        const days = [];

        for (
            let i = 0;
            i < firstDay;
            i++
        ) {

            days.push(null);

        }

        for (
            let day = 1;
            day <= numberOfDays;
            day++
        ) {

            days.push(day);

        }

        return days;

    }, [calendarMonth]);


    /* =====================================================
       TASKS FOR SELECTED DATE
    ===================================================== */

    const selectedDateTasks =
        tasks.filter(
            (task) =>
                task.date === selectedDate
        );


    const completedTaskCount =
        selectedDateTasks.filter(
            (task) =>
                task.completed
        ).length;


    const pendingTaskCount =
        selectedDateTasks.length -
        completedTaskCount;


    /* =====================================================
       ADD TASK
    ===================================================== */

    const openTaskModal = () => {

        setTaskTitle("");

        setTaskCategory(
            "Assignment"
        );

        setTaskDate(
            selectedDate
        );

        setTaskTime("");

        setTaskDescription("");

        setShowTaskModal(true);

    };


    const closeTaskModal = () => {

        setShowTaskModal(false);

    };


const handleAddTask = async (e) => {

    e.preventDefault();

    if (!taskTitle.trim()) {

        alert(
            "Please enter a task title."
        );

        return;

    }

    if (!taskDate) {

        alert(
            "Please select a date."
        );

        return;

    }

    /* =====================================================
       PREVENT PAST DATES
    ===================================================== */

    const currentDate = new Date();

    const todayKey = formatDateKey(currentDate);

    if (taskDate < todayKey) {

        alert(
            "Past dates cannot be selected. Please choose today or a future date."
        );

        return;

    }


    


        setIsSavingTask(true);
        setTaskError("");
        let newTask;
        try {
            newTask = await studentTasksApi.create({
                title: taskTitle.trim(),
                category: taskCategory,
                date: taskDate,
                time: taskTime,
                description: taskDescription.trim(),
            });
        } catch (error) {
            setTaskError(error.message || "Unable to create this planner task.");
            setIsSavingTask(false);
            return;
        }

        setTasks((previousTasks) => [...previousTasks, newTask]);


        setSelectedDate(
            taskDate
        );


        const selectedTaskDate =
            new Date(
                `${taskDate}T00:00:00`
            );


        setCalendarMonth(
            new Date(
                selectedTaskDate.getFullYear(),
                selectedTaskDate.getMonth(),
                1
            )
        );


        setShowTaskModal(false);
        setIsSavingTask(false);

    };


    /* =====================================================
       COMPLETE TASK
    ===================================================== */

    const toggleTask = async (taskId) => {
        const task = tasks.find((item) => item.id === taskId);
        if (!task) return;
        setTaskActionId(taskId);
        setTaskError("");
        try {
            const updatedTask = await studentTasksApi.setCompletion(
                taskId,
                !task.completed
            );
            setTasks((previousTasks) =>
                previousTasks.map((item) => item.id === taskId ? updatedTask : item)
            );
        } catch (error) {
            setTaskError(error.message || "Unable to update this planner task.");
        } finally {
            setTaskActionId("");
        }
    };


    /* =====================================================
       DELETE TASK
    ===================================================== */

    const deleteTask = async (taskId) => {

        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this task?"
            );

        if (!shouldDelete) {

            return;

        }

        setTaskActionId(taskId);
        setTaskError("");
        try {
            await studentTasksApi.remove(taskId);
            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== taskId)
            );
        } catch (error) {
            setTaskError(error.message || "Unable to delete this planner task.");
        } finally {
            setTaskActionId("");
        }

    };


    /* =====================================================
       SELECT CALENDAR DATE
    ===================================================== */

    const handleDateSelect = (day) => {

        if (!day) {

            return;

        }

        const selected =
            new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth(),
                day
            );

        setSelectedDate(
            formatDateKey(selected)
        );

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="student-dashboard">


            {/* =================================================
               SIDEBAR
            ================================================= */}

            <aside className="student-sidebar">
            



{/* STUDENT PROFILE SUMMARY */}

<div className="student-sidebar-profile">

    <div className="sidebar-profile-avatar">
        👨‍🎓
    </div>

    <div className="sidebar-profile-info">

        <h3>
            {studentProfile?.name || studentProfile?.username || "Student"}
        </h3>

        <p>
            Roll No: {studentProfile?.rollNumber || studentProfile?.username || "—"}
        </p>

   

    </div>

</div>


<nav className="student-nav">




                    <button
                        className="nav-item"
                        onClick={handleLogout}
                    >
                        ↪
                        <span>
                            Log Out
                        </span>
                    </button>


                    {/* DASHBOARD */}

                    <button
                        className={
                            activeSection === "dashboard"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "dashboard"
                            )
                        }
                    >

                        🏠

                        <span>
                            Dashboard
                        </span>

                    </button>


                    {/* FACULTY PDFS */}

                    <button
                        className={
                            activeSection === "pdfs"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "pdfs"
                            )
                        }
                    >

                        📄

                        <span>
                            Notes
                        </span>

                    </button>
                    <button
                        className={activeSection === "assignments" ? "nav-item active" : "nav-item"}
                        onClick={() => handleMenuClick("assignments")}
                    >
                        📝
                        <span>Assignments</span>
                    </button>
                    {/*Attendence*/}
                    <button
    className={
        activeSection === "attendance"
            ? "nav-item active"
            : "nav-item"
    }
    onClick={() => handleMenuClick("attendance")}
>
    📊
    <span>View Attendance</span>
</button>


                    {/* COMPLAINTS */}

                    <button
                        className={
                            activeSection === "complaints"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "complaints"
                            )
                        }
                    >

                        📦

                        <span>
                            Complaints Box
                        </span>

                    </button>


                    {/* OUTPASS */}

                    <button
                        className={
                            activeSection === "outpass"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "outpass"
                            )
                        }
                    >

                        🚪

                        <span>
                            Outpass Request
                        </span>

                    </button>


                    {/* ANNOUNCEMENTS */}

                    <button
                        className={
                            activeSection === "announcements"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "announcements"
                            )
                        }
                    >

                        📢

                        <span>
                            Announcements
                        </span>

                    </button>

                    <button
                        className={activeSection === "events" ? "nav-item active" : "nav-item"}
                        onClick={() => handleMenuClick("events")}
                    >
                        🎟️
                        <span>Campus Events</span>
                    </button>

                    <button
                        className={activeSection === "gallery" ? "nav-item active" : "nav-item"}
                        onClick={() => handleMenuClick("gallery")}
                    >
                        🏆
                        <span>Achievements & Gallery</span>
                    </button>


                    {/* SUGGESTIONS */}

                    <button
                        className={
                            activeSection === "suggestions"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "suggestions"
                            )
                        }
                    >

                        💡

                        <span>
                            Suggestions
                        </span>

                    </button>


                    {/* PLACEMENTS */}

                    <button
                        className={
                            activeSection === "placements"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            handleMenuClick(
                                "placements"
                            )
                        }
                    >

                        💼

                        <span>
                            Placements
                        </span>

                    </button>
                    {/* STUDENT PROFILE */}

<button
    className={
        activeSection === "profile"
            ? "nav-item active"
            : "nav-item"
    }
    onClick={() =>
        handleMenuClick("profile")
    }
>

    👤

    <span>
        My Profile
    </span>

</button>

                    

                </nav>


                <div className="sidebar-bottom">

                    <div className="future-text">

                        Better
                        <br />

                        Students
                        <br />

                        Brighter
                        <br />

                        Future 😊

                    </div>

                </div>

            </aside>


            {/* =================================================
               MAIN CONTENT
            ================================================= */}

            <main className="student-main">
                <PortalBackButton
                    role="student"
                    fallbackTo="/student"
                    onBack={handleSectionBack}
                />


                {/* =================================================
                   HEADER
                ================================================= */}

                <header className="student-header">

                    <div className="student-info">

                        <h1>
                            Hello, {studentProfile?.name || studentProfile?.username || "Student"} 👋
                        </h1>

                        <p>
                            Roll No: {studentProfile?.rollNumber || studentProfile?.username || "—"}
                            {studentProfile?.branch ? ` | ${studentProfile.branch}` : ""}
                        </p>

                    </div>


                    <div className="student-header-actions">

                    <div className="attendance-card">

                        <div className="attendance-circle">
                            {studentAttendance?.summary.percentage == null
                                ? "—"
                                : `${studentAttendance.summary.percentage}%`}
                        </div>

                        <div className="attendance-details">

                            <h4>
                                Overall Attendance
                            </h4>

                            <p>
                                <span>
                                    Present
                                </span>

                                <b>
                                    {studentAttendance?.summary.present ?? "—"}
                                </b>
                            </p>

                            <p>
                                <span>
                                    Absent
                                </span>

                                <b>
                                    {studentAttendance?.summary.absent ?? "—"}
                                </b>
                            </p>

                            <p>
                                <span>
                                    Total
                                </span>

                                <b>
                                    {studentAttendance?.summary.total ?? "—"}
                                </b>
                            </p>

                            <button
                                className="view-attendance-btn"
                                onClick={() =>
                                    handleMenuClick(
                                        "attendance"
                                    )
                                }
                            >
                                View Attendance →
                            </button>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="student-home-button"
                        onClick={() => navigate("/")}
                        aria-label="College Home"
                    >
                        🏠 <span>College Home</span>
                    </button>

                    </div>

                </header>
                


                {/* =================================================
                   DASHBOARD
                ================================================= */}

                {activeSection === "dashboard" && (

                    <section className="dashboard-content">

                        <div className="dashboard-grid">


                            {/* =================================================
                               WEEKLY TIMETABLE
                            ================================================= */}

                            <div className="dashboard-card timetable-card">

                                <div className="timetable-title">

                                    <div>

                                        <h2>
                                            Weekly Schedule
                                        </h2>

                                        <p>
                                            Your class schedule
                                        </p>

                                    </div>
                                    <span className="schedule-icon">
                                        📚
                                    </span>

                                </div>


                                {/* DAY SELECTOR */}

                                <div className="day-selector">

                                    {weekDays.map(
                                        (day) => (

                                            <button
                                                key={day}
                                                className={
                                                    selectedDay === day
                                                        ? "day-button selected"
                                                        : "day-button"
                                                }
                                                onClick={() =>
                                                    setSelectedDay(
                                                        day
                                                    )
                                                }
                                            >

                                                <span className="day-short">
                                                    {day.substring(
                                                        0,
                                                        3
                                                    )}
                                                </span>

                                                <span className="day-full">
                                                    {day}
                                                </span>

                                            </button>

                                        )
                                    )}

                                </div>


                                {/* SELECTED DAY */}

                                <div className="selected-day-heading">

                                    <div>

                                        <span className="schedule-label">
                                            SCHEDULE
                                        </span>

                                        <h3>
                                            {selectedDay}
                                        </h3>

                                    </div>

                                    <span className="class-count">
                                        {
                                            timetableData[
                                                selectedDay
                                            ].length
                                        } Classes
                                    </span>

                                </div>


                                {/* TIMELINE */}

                                <div className="class-timeline">

                                    {timetableData[
                                        selectedDay
                                    ].map(
                                        (item, index) => (

                                            <div
                                                className="timeline-item"
                                                key={
                                                    `${selectedDay}-${index}`
                                                }
                                            >

                                                <div className="timeline-time">

                                                    {item.time}

                                                </div>


                                                <div className="timeline-marker">

                                                    <span></span>

                                                </div>


                                                <div className="class-card">

                                                    <div className="class-card-top">

                                                        <span
                                                            className={
                                                                item.type === "Lab"
                                                                    ? "class-type lab"
                                                                    : "class-type lecture"
                                                            }
                                                        >
                                                            {item.type}
                                                        </span>

                                                        <span className="period-number">
                                                            Period{" "}
                                                            {item.period}
                                                        </span>

                                                    </div>


                                                    <h4>
                                                        {item.subject}
                                                    </h4>


                                                    <div className="class-details">

                                                        <span>
                                                            🕒{" "}
                                                            {item.time}
                                                        </span>

                                                        <span>
                                                            📍 {item.type==="Lab"?"Lab":"Classroom"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* =================================================
                               REAL INTERACTIVE CALENDAR
                            ================================================= */}

                            <div className="dashboard-card calendar-card">

                                <div className="calendar-title">

                                    <div>

                                        <h2>
                                            Student Planner
                                        </h2>

                                        <p>
                                            Plan your academic tasks
                                        </p>

                                    </div>

                                    <button
                                        className="today-button"
                                        onClick={
                                            goToToday
                                        }
                                    >
                                        Today
                                    </button>

                                </div>


                               

                                {/* MONTH / YEAR NAVIGATION */}

<div className="calendar-navigation">

    <button
        onClick={() => changeMonth(-1)}
        aria-label="Previous month"
    >
        ‹
    </button>

    <select
        value={calendarMonth.getMonth()}
        onChange={(e) => {
            setCalendarMonth(
                new Date(
                    calendarMonth.getFullYear(),
                    Number(e.target.value),
                    1
                )
            );
        }}
        className="calendar-month-select"
        aria-label="Select month"
    >
        {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ].map((month, index) => (
            <option
                key={month}
                value={index}
            >
                {month}
            </option>
        ))}
    </select>

    <select
        value={calendarMonth.getFullYear()}
        onChange={(e) => {
            setCalendarMonth(
                new Date(
                    Number(e.target.value),
                    calendarMonth.getMonth(),
                    1
                )
            );
        }}
        className="calendar-year-select"
        aria-label="Select year"
    >
        {Array.from(
            { length: 201 },
            (_, index) => 1900 + index
        ).map((year) => (
            <option
                key={year}
                value={year}
            >
                {year}
            </option>
        ))}
    </select>

    <button
        onClick={() => changeMonth(1)}
        aria-label="Next month"
    >
        ›
    </button>

</div>


                                {/* DATES */}

                                <div className="calendar-dates">

                                    {calendarDays.map(
                                        (day, index) => {

                                            if (!day) {

                                                return (
                                                    <div
                                                        key={
                                                            `empty-${index}`
                                                        }
                                                        className="calendar-empty"
                                                    />
                                                );

                                            }


                                            const date =
                                                new Date(
                                                    calendarMonth.getFullYear(),
                                                    calendarMonth.getMonth(),
                                                    day
                                                );


                                            const dateKey =
                                                formatDateKey(
                                                    date
                                                );


                                            const hasTasks =
                                                tasks.some(
                                                    (task) =>
                                                        task.date ===
                                                        dateKey
                                                );


                                            const isSelected =
                                                selectedDate ===
                                                dateKey;


                                            const isToday =
                                                formatDateKey(
                                                    today
                                                ) ===
                                                dateKey;


                                            return (

                                                <button
                                                    key={dateKey}
                                                    className={
                                                        `calendar-date ${
                                                            isSelected
                                                                ? "selected"
                                                                : ""
                                                        } ${
                                                            isToday
                                                                ? "today"
                                                                : ""
                                                        }`
                                                    }
                                                    onClick={() =>
                                                        handleDateSelect(
                                                            day
                                                        )
                                                    }
                                                >

                                                    <span>
                                                        {day}
                                                    </span>

                                                    {hasTasks && (
                                                        <span className="task-dot">
                                                        </span>
                                                    )}

                                                </button>

                                            );

                                        }
                                    )}

                                </div>


                                {/* SELECTED DATE */}

                                <div className="selected-date-section">

                                    <div className="selected-date-heading">

                                        <div>

                                            <span>
                                                SELECTED DATE
                                            </span>

                                            <h3>
                                                {formatDisplayDate(
                                                    selectedDate
                                                )}
                                            </h3>

                                        </div>

                                        <button
                                            className="add-task-button"
                                            onClick={
                                                openTaskModal
                                            }
                                        >
                                            + Add Task
                                        </button>

                                    </div>

                                    {taskError && (
                                        <p className="task-error" role="alert">
                                            {taskError}
                                        </p>
                                    )}

                                    {/* TASK SUMMARY */}

                                    <div className="task-summary">

                                        <span>
                                            <b>
                                                {
                                                    selectedDateTasks.length
                                                }
                                            </b>{" "}
                                            Tasks
                                        </span>

                                        <span className="completed-summary">
                                            <b>
                                                {
                                                    completedTaskCount
                                                }
                                            </b>{" "}
                                            Completed
                                        </span>

                                        <span className="pending-summary">
                                            <b>
                                                {
                                                    pendingTaskCount
                                                }
                                            </b>{" "}
                                            Pending
                                        </span>

                                    </div>


                                    {/* TASK LIST */}

                                    <div className="task-list">

                                        {isLoadingTasks ? (
                                            <p role="status">Loading your planner tasks...</p>
                                        ) : selectedDateTasks.length === 0 ? (

                                            <div className="empty-tasks">

                                                <div>
                                                    📝
                                                </div>

                                                <p>
                                                    No tasks for this date.
                                                </p>

                                                <small>
                                                    Add an assignment,
                                                    exam or personal
                                                    task to stay organized.
                                                </small>

                                            </div>

                                        ) : (

                                            selectedDateTasks.map(
                                                (task) => (

                                                    <div
                                                        key={task.id}
                                                        className={
                                                            task.completed
                                                                ? "task-item completed"
                                                                : "task-item"
                                                        }
                                                    >

                                                        <button
                                                            className={
                                                                task.completed
                                                                    ? "task-checkbox checked"
                                                                    : "task-checkbox"
                                                            }
                                                            onClick={() =>
                                                                toggleTask(
                                                                    task.id
                                                                )
                                                            }
                                                            disabled={taskActionId === task.id}
                                                            aria-label={
                                                                task.completed
                                                                    ? "Mark task incomplete"
                                                                    : "Mark task complete"
                                                            }
                                                        >
                                                            {task.completed
                                                                ? "✓"
                                                                : ""}
                                                        </button>


                                                        <div className="task-content">

                                                            <div className="task-title-row">

                                                                <h4>
                                                                    {task.title}
                                                                </h4>

                                                                <span
                                                                    className={
                                                                        `task-category ${task.category
                                                                            .toLowerCase()
                                                                            .replace(
                                                                                " ",
                                                                                "-"
                                                                            )}`
                                                                    }
                                                                >
                                                                    {
                                                                        task.category
                                                                    }
                                                                </span>

                                                            </div>


                                                            {task.time && (

                                                                <span className="task-time">
                                                                    🕒{" "}
                                                                    {task.time}
                                                                </span>

                                                            )}


                                                            {task.description && (

                                                                <p>
                                                                    {
                                                                        task.description
                                                                    }
                                                                </p>

                                                            )}

                                                        </div>


                                                        <button
                                                            className="delete-task-button"
                                                            onClick={() =>
                                                                deleteTask(
                                                                    task.id
                                                                )
                                                            }
                                                            disabled={taskActionId === task.id}
                                                            aria-label="Delete task"
                                                        >
                                                            🗑
                                                        </button>

                                                    </div>

                                                )
                                            )

                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                           QUICK INFORMATION
                        ================================================= */}

                        <div className="quick-info">

                            <div>
                                📄
                                <span>
                                    Latest Faculty Notes
                                </span>
                            </div>

                            <div>
                                📢
                                <span>
                                    {announcements.length} Announcements
                                </span>
                            </div>

                            <div>
                                💼
                                <span>
                                    Placement Drive Available
                                </span>
                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                   ATTENDANCE
                ================================================= */}

                {activeSection === "attendance" && (

                    <section className="module-section attendance-section">

                        <div className="attendance-page-header">

                            <div>

                                <h2>
                                    📊 Attendance
                                </h2>

                                <p>
                                    View your monthly and subject-wise attendance.
                                </p>

                            </div>

                            <button
                                className="attendance-back-btn"
                                onClick={() =>
                                    handleMenuClick("dashboard")
                                }
                            >
                                ← Back to Dashboard
                            </button>

                        </div>


                        {/* ATTENDANCE SUMMARY */}

                        <div className="attendance-summary">

                            <div className="attendance-summary-card">

                                <span>
                                    Overall Attendance
                                </span>

                                <strong>
                                    {studentAttendance?.summary.percentage == null
                                        ? "—"
                                        : `${studentAttendance.summary.percentage}%`}
                                </strong>

                            </div>


                            <div className="attendance-summary-card">

                                <span>
                                    Present
                                </span>

                                <strong>
                                    {studentAttendance?.summary.present ?? "—"}
                                </strong>

                            </div>


                            <div className="attendance-summary-card">

                                <span>
                                    Absent
                                </span>

                                <strong>
                                    {studentAttendance?.summary.absent ?? "—"}
                                </strong>

                            </div>


                            <div className="attendance-summary-card">

                                <span>
                                    Total Classes
                                </span>

                                <strong>
                                    {studentAttendance?.summary.total ?? "—"}
                                </strong>

                            </div>

                        </div>


                        {/* SUBJECT-WISE ATTENDANCE */}

                        <div className="attendance-block">

                            <h3>
                                Subject-wise Attendance
                            </h3>

                            <div className="attendance-table-wrapper">

                                <table className="attendance-table">

                                    <thead>

                                        <tr>
                                            <th>Subject</th>
                                            <th>Present</th>
                                            <th>Absent</th>
                                            <th>Total</th>
                                            <th>Attendance</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {isLoadingStudentAttendance ? (
                                            <tr><td colSpan="5">Loading attendance...</td></tr>
                                        ) : studentAttendanceError ? (
                                            <tr><td colSpan="5" role="alert">{studentAttendanceError}</td></tr>
                                        ) : studentAttendance?.subjects.length ? (
                                            studentAttendance.subjects.map((subject) => (
                                                <tr key={subject.subject}>
                                                    <td>{subject.subject}</td>
                                                    <td>{subject.present}</td>
                                                    <td>{subject.absent}</td>
                                                    <td>{subject.total}</td>
                                                    <td className={subject.percentage >= 75 ? "attendance-good" : "attendance-low"}>
                                                        {subject.percentage}%
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5">No attendance records have been submitted yet.</td></tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* MONTHLY ATTENDANCE */}

                        <div className="attendance-block">

                            <h3>
                                Attendance records
                            </h3>

                            <div className="attendance-table-wrapper">

                                <table className="attendance-table">

                                    <thead>

                                        <tr>
                                            <th>Date</th>
                                            <th>Subject</th>
                                            <th>Period</th>
                                            <th>Status</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {isLoadingStudentAttendance ? (
                                            <tr><td colSpan="4">Loading attendance...</td></tr>
                                        ) : studentAttendanceError ? (
                                            <tr><td colSpan="4" role="alert">{studentAttendanceError}</td></tr>
                                        ) : studentAttendance?.records.length ? (
                                            studentAttendance.records.map((record, index) => (
                                                <tr key={`${record.date}-${record.subject}-${record.period}-${index}`}>
                                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                                    <td>{record.subject}</td>
                                                    <td>{record.period}</td>
                                                    <td className={record.status === "ABSENT" ? "status-absent" : "status-present"}>
                                                        {record.status}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4">No attendance records have been submitted yet.</td></tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                   FACULTY PDFS
                ================================================= */}

                {activeSection === "pdfs" && (

                    <section className="module-section">

                        <h2>
                            📄 Faculty PDFs
                        </h2>

                        <p>
                            Study materials and documents
                            uploaded by faculty.
                        </p>

                        {studyMaterialsError && <p role="alert">{studyMaterialsError}</p>}
                        {isLoadingStudyMaterials ? (
                            <p>Loading study materials...</p>
                        ) : studyMaterials.length === 0 ? (
                            <p>No study materials have been published for your section yet.</p>
                        ) : (
                            <div className="document-list">
                                {studyMaterials.map((material) => (
                                    <div className="document" key={material.id || material._id}>
                                        <div>
                                            <strong>{material.title}</strong>
                                            <p>
                                                {material.subject} · {material.unit} ·
                                                {" "}{material.section === "*" ? "All sections" : material.section === "__unassigned__" ? "Unassigned section" : `Section ${material.section}`}
                                            </p>
                                            {material.description && <p>{material.description}</p>}
                                            <small>
                                                {material.fileName}
                                                {material.uploadedDate ? ` · Published ${material.uploadedDate}` : ""}
                                            </small>
                                        </div>
                                        <a href={material.fileUrl} target="_blank" rel="noreferrer">
                                            View / Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                    </section>

                )}


                {activeSection === "assignments" && (
                    <section className="module-section">
                        <h2>📝 Assignments</h2>
                        <p>View coursework assigned to your branch and section, submit your response, and review faculty feedback.</p>
                        {assignmentError && <p role="alert">{assignmentError}</p>}
                        {assignmentSuccess && <p role="status">{assignmentSuccess}</p>}
                        {isLoadingAssignments ? (
                            <p>Loading your assignments...</p>
                        ) : studentAssignments.length === 0 ? (
                            <p>No assignments have been published for your section yet.</p>
                        ) : (
                            <div style={{ display: "grid", gap: "18px", maxWidth: "850px" }}>
                                {studentAssignments.map((assignment) => {
                                    const submission = assignment.submission;
                                    const isGraded = Boolean(submission?.gradedAt);
                                    return (
                                        <article key={assignment.id} className="attendance-block">
                                            <h3>{assignment.title}</h3>
                                            <p>
                                                {assignment.subject} · Due {new Date(assignment.dueDate).toLocaleDateString()} ·
                                                {" "}{assignment.maxMarks} marks · {assignment.status}
                                            </p>
                                            {assignment.description && <p style={{ whiteSpace: "pre-wrap" }}>{assignment.description}</p>}
                                            {submission && (
                                                <div>
                                                    <p>
                                                        Submitted {new Date(submission.submittedAt).toLocaleString()}
                                                        {submission.isLate ? " (late)" : ""}
                                                    </p>
                                                    {submission.fileUrl && (
                                                        <p>
                                                            Attachment:{" "}
                                                            <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                                                                Open submitted attachment
                                                            </a>
                                                        </p>
                                                    )}
                                                    {isGraded && (
                                                        <p role="status">
                                                            Grade: {submission.marks}/{assignment.maxMarks}
                                                            {submission.feedback ? ` · Feedback: ${submission.feedback}` : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {isGraded ? (
                                                <p>This submission has been graded and can no longer be changed.</p>
                                            ) : (
                                                <form
                                                    className="student-module-form"
                                                    onSubmit={(event) => handleAssignmentSubmit(event, assignment.id)}
                                                >
                                                    <label htmlFor={`assignment-answer-${assignment.id}`}>
                                                        Your response
                                                    </label>
                                                    <textarea
                                                        id={`assignment-answer-${assignment.id}`}
                                                        value={assignmentAnswers[assignment.id] || ""}
                                                        onChange={(event) => setAssignmentAnswers((answers) => ({
                                                            ...answers,
                                                            [assignment.id]: event.target.value,
                                                        }))}
                                                        maxLength={10000}
                                                        required
                                                    />
                                                    <label htmlFor={`assignment-attachment-${assignment.id}`}>
                                                        Attachment URL (optional)
                                                    </label>
                                                    <input
                                                        id={`assignment-attachment-${assignment.id}`}
                                                        type="url"
                                                        placeholder="https://..."
                                                        maxLength={2048}
                                                        value={assignmentAttachmentUrls[assignment.id] || ""}
                                                        onChange={(event) => setAssignmentAttachmentUrls((urls) => ({
                                                            ...urls,
                                                            [assignment.id]: event.target.value,
                                                        }))}
                                                    />
                                                    <button type="submit" disabled={submittingAssignmentId === assignment.id}>
                                                        {submittingAssignmentId === assignment.id
                                                            ? "Submitting..."
                                                            : submission ? "Update submission" : "Submit assignment"}
                                                    </button>
                                                </form>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}


                {/* =================================================
                   COMPLAINTS
                ================================================= */}

                {activeSection === "complaints" && (

                    <section className="module-section">

                        <h2>
                            📦 Complaints Box
                        </h2>

                        <p>
                            Submit your complaint to
                            your department. You can track its status below.
                        </p>

                        {complaintError && <p role="alert">{complaintError}</p>}
                        {complaintSuccess && <p role="status">{complaintSuccess}</p>}

                        <form
                            className="student-module-form"
                            onSubmit={
                                handleComplaint
                            }
                        >

                            <label htmlFor="student-complaint-subject">Subject</label>
                            <input
                                id="student-complaint-subject"
                                value={complaintSubject}
                                onChange={(e) => setComplaintSubject(e.target.value)}
                                maxLength={120}
                                required
                            />
                            <label htmlFor="student-complaint-details">Complaint details</label>
                            <textarea
                                id="student-complaint-details"
                                placeholder="Write your complaint here..."
                                value={complaint}
                                onChange={(e) =>
                                    setComplaint(
                                        e.target.value
                                    )
                                }
                                maxLength={3000}
                                required
                            />

                            <button type="submit" disabled={isSubmittingComplaint}>
                                {isSubmittingComplaint ? "Submitting..." : "Submit Complaint"}
                            </button>

                        </form>

                        <div className="student-complaint-history" aria-live="polite">
                            <h3>Your complaints</h3>
                            {isLoadingComplaints ? (
                                <p>Loading your complaints...</p>
                            ) : studentComplaints.length ? (
                                studentComplaints.map((item) => (
                                    <article key={item._id}>
                                        <h4>{item.subject}</h4>
                                        <p>{item.description}</p>
                                        <p>Status: {item.status.replaceAll("_", " ")}</p>
                                        {item.response && <p>Department response: {item.response}</p>}
                                    </article>
                                ))
                            ) : (
                                <p>You have not submitted any complaints yet.</p>
                            )}
                        </div>

                    </section>

                )}


                {/* =================================================
                   OUTPASS
                ================================================= */}

                {activeSection === "outpass" && (

                    <section className="module-section">

                        <h2>
                            🚪 Outpass Request
                        </h2>

                        <p>
                            Request permission to leave the campus.
                        </p>

                        {outpassError && <p role="alert">{outpassError}</p>}
                        {outpassSuccess && <p role="status">{outpassSuccess}</p>}

                        <form
                            className="student-module-form"
                            onSubmit={
                                handleOutpass
                            }
                        >

                            <textarea
                                placeholder="Enter reason for outpass..."
                                value={outpassReason}
                                onChange={(e) =>
                                    setOutpassReason(
                                        e.target.value
                                    )
                                }
                            />

                            <input
                                type="text"
                                placeholder="Destination"
                                value={outpassDestination}
                                onChange={(e) =>
                                    setOutpassDestination(
                                        e.target.value
                                    )
                                }
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <input
                                    type="date"
                                    value={outpassFromDate}
                                    onChange={(e) => setOutpassFromDate(e.target.value)}
                                />
                                <input
                                    type="date"
                                    value={outpassToDate}
                                    onChange={(e) => setOutpassToDate(e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={isSubmittingOutpass}>
                                {isSubmittingOutpass ? "Submitting..." : "Submit Outpass Request"}
                            </button>

                        </form>

                        <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
                            {outpassRequests.length === 0 ? (
                                <div className="empty-tasks">
                                    <p>No outpass requests yet.</p>
                                </div>
                            ) : (
                                outpassRequests.map((request) => (
                                    <div key={request._id || request.id} className="task-item">
                                        <div className="task-content">
                                            <div className="task-title-row">
                                                <h4>{request.destination}</h4>
                                                <span className={`task-category ${String(request.status || "pending").toLowerCase()}`}>
                                                    {String(request.status || "PENDING").replace(/^./, (char) => char.toUpperCase())}
                                                </span>
                                            </div>
                                            <p>{request.reason}</p>
                                            <small>
                                                {request.fromDate ? new Date(request.fromDate).toLocaleDateString() : ""} → {request.toDate ? new Date(request.toDate).toLocaleDateString() : ""}
                                            </small>
                                            {(request.reviewRemarks || request.rejectionReason) && (
                                                <p>
                                                    <strong>Review note:</strong>{" "}
                                                    {request.reviewRemarks || request.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </section>

                )}


                {/* =================================================
                   ANNOUNCEMENTS
                ================================================= */}

                {activeSection === "announcements" && (

                    <section className="module-section">

                        <h2>
                            📢 Announcements
                        </h2>

                        {announcementError && (
                            <p role="alert">{announcementError}</p>
                        )}

                        <div className="announcement-list">
                            {isLoadingAnnouncements ? (
                                <p>Loading announcements...</p>
                            ) : announcements.length ? (
                                announcements.map((announcement) => (
                                    <article key={announcement.id}>
                                        <b>📌 {announcement.title}</b>
                                        <p>{announcement.message}</p>
                                        <small>
                                            {announcement.category} · {announcement.priority} priority · {announcement.date}
                                            {announcement.createdByName
                                                ? ` · By ${announcement.createdByName}`
                                                : ""}
                                        </small>
                                    </article>
                                ))
                            ) : (
                                <p>No announcements have been published for you yet.</p>
                            )}
                        </div>

                    </section>

                )}

                {activeSection === "events" && (
                    <section className="module-section">
                        <h2>🎟️ Campus Events</h2>
                        <p>Upcoming events published by your college.</p>
                        {campusEventsError && <p role="alert">{campusEventsError}</p>}
                        {isLoadingCampusEvents ? (
                            <p>Loading campus events...</p>
                        ) : campusEvents.length === 0 ? (
                            <p>No upcoming campus events have been published.</p>
                        ) : (
                            <div style={{ display: "grid", gap: "16px", maxWidth: "850px" }}>
                                {campusEvents.map((event) => (
                                    <article className="attendance-block" key={event.id}>
                                        <h3>{event.title}</h3>
                                        <p>
                                            {event.category} · {new Date(`${event.date}T00:00:00`).toLocaleDateString()}
                                            {event.location ? ` · ${event.location}` : ""}
                                        </p>
                                        {event.description && (
                                            <p style={{ whiteSpace: "pre-wrap" }}>{event.description}</p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeSection === "gallery" && (
                    <section className="module-section">
                        <h2>🏆 Achievements & Gallery</h2>
                        <p>Campus achievements, celebrations, and highlights.</p>
                        {galleryError && <p role="alert">{galleryError}</p>}
                        {isLoadingGallery ? (
                            <p>Loading gallery posts...</p>
                        ) : galleryPosts.length === 0 ? (
                            <p>No achievements or gallery posts have been published yet.</p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                                {galleryPosts.map((post) => (
                                    <article className="attendance-block" key={post.id}>
                                        {post.imageUrl && (
                                            <img
                                                src={post.imageUrl}
                                                alt={post.title}
                                                loading="lazy"
                                                style={{ width: "100%", maxHeight: "260px", objectFit: "cover", borderRadius: "10px", marginBottom: "12px" }}
                                            />
                                        )}
                                        <p>
                                            {post.category} · {new Date(`${post.date}T00:00:00`).toLocaleDateString()}
                                        </p>
                                        <h3>{post.title}</h3>
                                        <p style={{ whiteSpace: "pre-wrap" }}>{post.description}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}


                {/* =================================================
                   SUGGESTIONS
                ================================================= */}

                {activeSection === "suggestions" && (

                    <section className="module-section">

                        <h2>
                            💡 Suggestions
                        </h2>

                        <p>
                            Help us improve the college
                            by sharing your ideas.
                        </p>

                        {suggestionError && <p role="alert">{suggestionError}</p>}
                        {suggestionSuccess && <p role="status">{suggestionSuccess}</p>}

                        <form
                            className="student-module-form"
                            onSubmit={
                                handleSuggestion
                            }
                        >

                            <textarea
                                placeholder="Enter your suggestion..."
                                value={suggestion}
                                maxLength={3000}
                                onChange={(e) =>
                                    setSuggestion(
                                        e.target.value
                                    )
                                }
                            />

                            <button type="submit" disabled={isSubmittingSuggestion}>
                                {isSubmittingSuggestion ? "Submitting..." : "Submit Suggestion"}
                            </button>

                        </form>

                        <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
                            {studentSuggestions.length === 0 ? (
                                <p>No suggestions submitted yet.</p>
                            ) : (
                                studentSuggestions.map((item) => (
                                    <article key={item._id} className="task-item">
                                        <div className="task-content">
                                            <div className="task-title-row">
                                                <h4>Suggestion</h4>
                                                <span className={`task-category ${String(item.status || "SUBMITTED").toLowerCase().replaceAll("_", "-")}`}>
                                                    {String(item.status || "SUBMITTED").replaceAll("_", " ")}
                                                </span>
                                            </div>
                                            <p>{item.message}</p>
                                            {item.response && (
                                                <p><strong>Department response:</strong> {item.response}</p>
                                            )}
                                            <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                    </section>

                )}


                {/* =================================================
                   PLACEMENTS
                ================================================= */}

                {activeSection === "placements" && (

                    <section className="module-section">

                        <h2>
                            💼 Placements
                        </h2>

                        {placementsError && <p role="alert">{placementsError}</p>}
                        {isLoadingPlacements ? (
                            <p>Loading placement opportunities...</p>
                        ) : studentPlacements.length === 0 ? (
                            <p>No open placement opportunities are available for your branch.</p>
                        ) : (
                            <div className="placement-list">
                                {studentPlacements.map((placement) => (
                                    <article key={placement.id}>
                                        <h3>{placement.company}</h3>
                                        <p>{placement.role} · {placement.location}</p>
                                        {placement.eligibility && <p>Eligibility: {placement.eligibility}</p>}
                                        {placement.package && <p>Package: {placement.package}</p>}
                                        <p>{placement.description}</p>
                                        <p>Apply by {new Date(`${placement.deadline}T00:00:00`).toLocaleDateString()}</p>
                                        {placement.applyLink ? (
                                            <a href={placement.applyLink} target="_blank" rel="noreferrer">
                                                Apply / View Details
                                            </a>
                                        ) : (
                                            <span>Contact placement cell for application details.</span>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}

                    </section>

                )}
                {/* =================================================
   STUDENT PROFILE
================================================= */}

{activeSection === "profile" && (

    <section className="module-section student-profile-section">

        {/* PROFILE PAGE HEADER */}

        <div className="profile-page-header">

            <div>

                <h2>
                    👤 My Profile
                </h2>

                <p>
                    View your personal and academic information.
                </p>
                {studentProfileError && <p role="alert">{studentProfileError}</p>}

            </div>

        </div>


        {/* PROFILE CARD */}

        <div className="student-profile-card">


            {/* PROFILE HEADER */}

            <div className="profile-header">

                <div className="profile-avatar">
                    👨‍🎓
                </div>

                <div className="profile-header-info">

                    <h2>
                        {studentProfile?.name || studentProfile?.username || "Student"}
                    </h2>

                    <p>
                        Roll No: {studentProfile?.rollNumber || studentProfile?.username || "—"}
                    </p>

                    <span className="profile-status">
                        ● Active Student
                    </span>

                </div>

            </div>


            {/* PERSONAL INFORMATION */}

            <div className="profile-block">

                <h3>
                    Personal Information
                </h3>

                <div className="profile-details-grid">


                    <div className="profile-detail">

                        <span>
                            Full Name
                        </span>

                        <strong>
                            {studentProfile?.name || studentProfile?.username || "Student"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Student ID
                        </span>

                        <strong>
                            {studentProfile?.rollNumber || studentProfile?.username || "—"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Email
                        </span>

                        <strong>
                            {studentProfile?.email || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Phone Number
                        </span>

                        <strong>
                            {studentProfile?.phone || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Date of Birth
                        </span>

                        <strong>
                            {studentProfile?.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString() : "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Gender
                        </span>

                        <strong>
                            {studentProfile?.gender || "Not provided"}
                        </strong>

                    </div>


                </div>

            </div>


            {/* ACADEMIC INFORMATION */}

            <div className="profile-block">

                <h3>
                    Academic Information
                </h3>

                <div className="profile-details-grid">


                    <div className="profile-detail">

                        <span>
                            Department
                        </span>

                        <strong>
                            {studentProfile?.branch || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Course
                        </span>

                        <strong>
                            {studentProfile?.course || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Year
                        </span>

                        <strong>
                            {studentProfile?.year || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Section
                        </span>

                        <strong>
                            {studentProfile?.section || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Admission Year
                        </span>

                        <strong>
                            {studentProfile?.admissionYear || (studentProfile?.createdAt ? new Date(studentProfile.createdAt).getFullYear() : "Not provided")}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Semester
                        </span>

                        <strong>
                            {studentProfile?.semester || "Not provided"}
                        </strong>

                    </div>


                </div>

            </div>


            {/* PARENT / GUARDIAN INFORMATION */}

            <div className="profile-block">

                <h3>
                    Parent / Guardian Information
                </h3>

                <div className="profile-details-grid">


                    <div className="profile-detail">

                        <span>
                            Parent / Guardian Name
                        </span>

                        <strong>
                            {studentProfile?.guardianName || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Relationship
                        </span>

                        <strong>
                            {studentProfile?.guardianRelationship || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Contact Number
                        </span>

                        <strong>
                            {studentProfile?.guardianPhone || "Not provided"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Emergency Contact
                        </span>

                        <strong>
                            {studentProfile?.emergencyPhone || "Not provided"}
                        </strong>

                    </div>


                </div>

            </div>


            {/* ADDRESS */}

            <div className="profile-block">

                <h3>
                    Address
                </h3>

                <div className="profile-address">

                    <span>
                        Permanent Address
                    </span>

                    <strong>
                        {studentProfile?.address || "Not provided"}
                    </strong>

                </div>

            </div>


        </div>

    </section>

)}

            </main>


            {/* =================================================
               ADD TASK MODAL
            ================================================= */}

            {showTaskModal && (

                <div
                    className="task-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeTaskModal();
                        }

                    }}
                >

                    <div
                        className="task-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-task-title"
                    >

                        <div className="task-modal-header">

                            <div>

                                <span>
                                    STUDENT PLANNER
                                </span>

                                <h2 id="add-task-title">
                                    Add New Task
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeTaskModal
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="task-form"
                            onSubmit={
                                handleAddTask
                            }
                        >

                            <label>
                                Task Title

                                <input
                                    type="text"
                                    placeholder="Example: Complete DBMS Assignment"
                                    value={taskTitle}
                                    onChange={(e) =>
                                        setTaskTitle(
                                            e.target.value
                                        )
                                    }
                                    autoFocus
                                />

                            </label>


                            <div className="task-form-row">

                                <label>
                                    Category

                                    <select
                                        value={
                                            taskCategory
                                        }
                                        onChange={(e) =>
                                            setTaskCategory(
                                                e.target.value
                                            )
                                        }
                                    >

                                        {taskCategories.map(
                                            (category) => (

                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </label>


                                <label>
                                    Date

                                    <input
                                        type="date"
                                        value={
                                            taskDate
                                        }
                                        onChange={(e) =>
                                            setTaskDate(
                                                e.target.value
                                            )
                                        }
                                    />

                                </label>

                            </div>


                            <label>
                                Time
                                <span className="optional">
                                    Optional
                                </span>

                                <input
                                    type="time"
                                    value={
                                        taskTime
                                    }
                                    onChange={(e) =>
                                        setTaskTime(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <label>
                                Description
                                <span className="optional">
                                    Optional
                                </span>

                                <textarea
                                    placeholder="Add some details..."
                                    value={
                                        taskDescription
                                    }
                                    onChange={(e) =>
                                        setTaskDescription(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <div className="task-form-actions">

                                <button
                                    type="button"
                                    className="cancel-task-button"
                                    onClick={
                                        closeTaskModal
                                    }
                                    disabled={isSavingTask}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-task-button"
                                    disabled={isSavingTask}
                                >
                                    {isSavingTask ? "Saving..." : "Save Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default StudentDashboard;