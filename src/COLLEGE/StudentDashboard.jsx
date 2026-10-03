import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";


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

    /* =====================================================
       GENERAL DASHBOARD STATE
    ===================================================== */

    const [activeSection, setActiveSection] =
        useState("dashboard");

    const [complaint, setComplaint] =
        useState("");

    const [suggestion, setSuggestion] =
        useState("");

    const [outpass, setOutpass] =
        useState("");
    const [outpassRequests, setOutpassRequests] =
    useState(() => {

        try {

            const savedRequests =
                localStorage.getItem(
                    "edulentra_outpass_requests"
                );

            return savedRequests
                ? JSON.parse(savedRequests)
                : [];

        } catch (error) {

            console.error(
                "Unable to load outpass requests:",
                error
            );

            return [];

        }

    });


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

    const [tasks, setTasks] =
        useState(() => {

            try {

                const savedTasks =
                    localStorage.getItem(
                        "edulentra_student_tasks"
                    );

                return savedTasks
                    ? JSON.parse(savedTasks)
                    : [];

            } catch (error) {

                console.error(
                    "Unable to load student tasks:",
                    error
                );

                return [];

            }

        });


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


    /* =====================================================
       SAVE TASKS TO LOCAL STORAGE
    ===================================================== */

    useEffect(() => {

        try {

            localStorage.setItem(
                "edulentra_student_tasks",
                JSON.stringify(tasks)
            );

        } catch (error) {

            console.error(
                "Unable to save student tasks:",
                error
            );

        }

    }, [tasks]);


    /* =====================================================
       MENU
    ===================================================== */

    const handleMenuClick = (section) => {

        setActiveSection(section);

    };


    /* =====================================================
       COMPLAINT
    ===================================================== */

    const handleComplaint = (e) => {

        e.preventDefault();

        if (!complaint.trim()) {

            alert(
                "Please enter your complaint."
            );

            return;

        }

        alert(
            "Complaint submitted successfully!"
        );

        setComplaint("");

    };


    /* =====================================================
       SUGGESTION
    ===================================================== */

    const handleSuggestion = (e) => {

        e.preventDefault();

        if (!suggestion.trim()) {

            alert(
                "Please enter your suggestion."
            );

            return;

        }

        alert(
            "Suggestion submitted successfully!"
        );

        setSuggestion("");

    };


    /* =====================================================
       OUTPASS
    ===================================================== */

    const handleOutpass = (e) => {

        e.preventDefault();

        if (!outpass.trim()) {

            alert(
                "Please enter the reason for outpass."
            );

            return;

        }

        alert(
            "Outpass request submitted successfully!"
        );

        setOutpass("");

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


const handleAddTask = (e) => {

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


    


        const newTask = {

            id:
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 9)}`,

            title:
                taskTitle.trim(),

            category:
                taskCategory,

            date:
                taskDate,

            time:
                taskTime,

            description:
                taskDescription.trim(),

            completed:
                false,

            createdAt:
                new Date().toISOString()

        };


        setTasks(
            (previousTasks) => [
                ...previousTasks,
                newTask
            ]
        );


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

    };


    /* =====================================================
       COMPLETE TASK
    ===================================================== */

    const toggleTask = (taskId) => {

        setTasks(
            (previousTasks) =>
                previousTasks.map(
                    (task) =>
                        task.id === taskId
                            ? {
                                ...task,
                                completed:
                                    !task.completed
                            }
                            : task
                )
        );

    };


    /* =====================================================
       DELETE TASK
    ===================================================== */

    const deleteTask = (taskId) => {

        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this task?"
            );

        if (!shouldDelete) {

            return;

        }

        setTasks(
            (previousTasks) =>
                previousTasks.filter(
                    (task) =>
                        task.id !== taskId
                )
        );

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
            Sai Student
        </h3>

        <p>
            Student ID: EDU2026CSE001
        </p>

   

    </div>

</div>


<nav className="student-nav">




                    {/* HOME */}

                    <button
                        className="nav-item"
                        onClick={() => navigate("/")}
                    >
                        🏡
                        <span>
                            Home
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


                {/* =================================================
                   HEADER
                ================================================= */}

                <header className="student-header">

                    <div className="student-info">

                        <h1>
                            Hello, Student 👋
                        </h1>

                        <p>
                            Roll No: 23CS056
                            &nbsp; | &nbsp;
                            Computer Science Engineering
                        </p>

                    </div>


                    <div className="attendance-card">

                        <div className="attendance-circle">
                            85%
                        </div>

                        <div className="attendance-details">

                            <h4>
                                Today's Attendance
                            </h4>

                            <p>
                                <span>
                                    Present
                                </span>

                                <b>
                                    10
                                </b>
                            </p>

                            <p>
                                <span>
                                    Absent
                                </span>

                                <b>
                                    1
                                </b>
                            </p>

                            <p>
                                <span>
                                    Total
                                </span>

                                <b>
                                    11
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

                                        {selectedDateTasks.length === 0 ? (

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
                                    3 New Announcements
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
                                    85%
                                </strong>

                            </div>


                            <div className="attendance-summary-card">

                                <span>
                                    Present
                                </span>

                                <strong>
                                    102
                                </strong>

                            </div>


                            <div className="attendance-summary-card">

                                <span>
                                    Absent
                                </span>

                                <strong>
                                    18
                                </strong>

                            </div>


                            <div className="attendance-summary-card">

                                <span>
                                    Total Classes
                                </span>

                                <strong>
                                    120
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

                                        <tr>
                                            <td>SSP</td>
                                            <td>20</td>
                                            <td>3</td>
                                            <td>23</td>
                                            <td className="attendance-good">
                                                87%
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>NLP</td>
                                            <td>18</td>
                                            <td>2</td>
                                            <td>20</td>
                                            <td className="attendance-good">
                                                90%
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>IQTA</td>
                                            <td>19</td>
                                            <td>4</td>
                                            <td>23</td>
                                            <td className="attendance-good">
                                                83%
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>CV & IP</td>
                                            <td>21</td>
                                            <td>4</td>
                                            <td>25</td>
                                            <td className="attendance-good">
                                                84%
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>DV</td>
                                            <td>24</td>
                                            <td>5</td>
                                            <td>29</td>
                                            <td className="attendance-good">
                                                83%
                                            </td>
                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* MONTHLY ATTENDANCE */}

                        <div className="attendance-block">

                            <h3>
                                September 2026 Attendance
                            </h3>

                            <div className="attendance-table-wrapper">

                                <table className="attendance-table">

                                    <thead>

                                        <tr>
                                            <th>Date</th>
                                            <th>Day</th>
                                            <th>Classes</th>
                                            <th>Present</th>
                                            <th>Absent</th>
                                            <th>Status</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        <tr>
                                            <td>01 Sep 2026</td>
                                            <td>Tuesday</td>
                                            <td>5</td>
                                            <td>5</td>
                                            <td>0</td>
                                            <td className="status-present">
                                                Present
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>02 Sep 2026</td>
                                            <td>Wednesday</td>
                                            <td>5</td>
                                            <td>4</td>
                                            <td>1</td>
                                            <td className="status-present">
                                                Present
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>03 Sep 2026</td>
                                            <td>Thursday</td>
                                            <td>5</td>
                                            <td>5</td>
                                            <td>0</td>
                                            <td className="status-present">
                                                Present
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>04 Sep 2026</td>
                                            <td>Friday</td>
                                            <td>5</td>
                                            <td>3</td>
                                            <td>2</td>
                                            <td className="status-absent">
                                                Low Attendance
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>05 Sep 2026</td>
                                            <td>Saturday</td>
                                            <td>4</td>
                                            <td>4</td>
                                            <td>0</td>
                                            <td className="status-present">
                                                Present
                                            </td>
                                        </tr>

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

                        <div className="document-list">

                            <div className="document">

                                <span>
                                    📄 DBMS Unit 1 Notes.pdf
                                </span>

                                <button>
                                    View
                                </button>

                            </div>


                            <div className="document">

                                <span>
                                    📄 Artificial Intelligence Notes.pdf
                                </span>

                                <button>
                                    View
                                </button>

                            </div>


                            <div className="document">

                                <span>
                                    📄 Java Programming.pdf
                                </span>

                                <button>
                                    View
                                </button>

                            </div>


                            <div className="document">

                                <span>
                                    📄 Operating Systems.pdf
                                </span>

                                <button>
                                    View
                                </button>

                            </div>

                        </div>

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
                            the college administration.
                        </p>

                        <form
                            className="student-module-form"
                            onSubmit={
                                handleComplaint
                            }
                        >

                            <textarea
                                placeholder="Write your complaint here..."
                                value={complaint}
                                onChange={(e) =>
                                    setComplaint(
                                        e.target.value
                                    )
                                }
                            />

                            <button type="submit">
                                Submit Complaint
                            </button>

                        </form>

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
                            Request permission to leave
                            the campus.
                        </p>

                        <form
                            className="student-module-form"
                            onSubmit={
                                handleOutpass
                            }
                        >

                            <textarea
                                placeholder="Enter reason for outpass..."
                                value={outpass}
                                onChange={(e) =>
                                    setOutpass(
                                        e.target.value
                                    )
                                }
                            />

                            <button type="submit">
                                Submit Outpass Request
                            </button>

                        </form>

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

                        <div className="announcement-list">

                            <div>

                                <b>
                                    📌 Internal Exams
                                </b>

                                <p>
                                    Internal examinations
                                    will begin next week.
                                </p>

                            </div>


                            <div>

                                <b>
                                    📌 Hackathon
                                </b>

                                <p>
                                    Registration for the
                                    upcoming hackathon is open.
                                </p>

                            </div>


                            <div>

                                <b>
                                    📌 Placement Drive
                                </b>

                                <p>
                                    New placement opportunities
                                    are available.
                                </p>

                            </div>

                        </div>

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

                        <form
                            className="student-module-form"
                            onSubmit={
                                handleSuggestion
                            }
                        >

                            <textarea
                                placeholder="Enter your suggestion..."
                                value={suggestion}
                                onChange={(e) =>
                                    setSuggestion(
                                        e.target.value
                                    )
                                }
                            />

                            <button type="submit">
                                Submit Suggestion
                            </button>

                        </form>

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

                        <div className="placement-list">

                            <div>

                                <h3>
                                    TCS
                                </h3>

                                <p>
                                    Eligibility: 7 CGPA+
                                </p>

                                <p>
                                    Package: 6 LPA
                                </p>

                                <button>
                                    View Details
                                </button>

                            </div>


                            <div>

                                <h3>
                                    Infosys
                                </h3>

                                <p>
                                    Eligibility: 60%+
                                </p>

                                <p>
                                    Package: 5 LPA
                                </p>

                                <button>
                                    View Details
                                </button>

                            </div>


                            <div>

                                <h3>
                                    Accenture
                                </h3>

                                <p>
                                    Eligibility: 6.5 CGPA+
                                </p>

                                <p>
                                    Package: 5.5 LPA
                                </p>

                                <button>
                                    View Details
                                </button>

                            </div>

                        </div>

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
                        Sai Student
                    </h2>

                    <p>
                        Student ID: EDU2026CSE001
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
                            Sai Student
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Student ID
                        </span>

                        <strong>
                            EDU2026CSE001
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Email
                        </span>

                        <strong>
                            student@edulentra.com
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Phone Number
                        </span>

                        <strong>
                            +91 98765 43210
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Date of Birth
                        </span>

                        <strong>
                            15 June 2005
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Gender
                        </span>

                        <strong>
                            Female
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
                            Computer Science &amp; Engineering
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Course
                        </span>

                        <strong>
                            B.Tech
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Year
                        </span>

                        <strong>
                            3rd Year
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Section
                        </span>

                        <strong>
                            CSE-A
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Admission Year
                        </span>

                        <strong>
                            2024
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Semester
                        </span>

                        <strong>
                            5th Semester
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
                            Raj Kumar
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Relationship
                        </span>

                        <strong>
                            Father
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Contact Number
                        </span>

                        <strong>
                            +91 91234 56789
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Emergency Contact
                        </span>

                        <strong>
                            +91 91234 56789
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
                        Hyderabad, Telangana, India
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
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-task-button"
                                >
                                    Save Task
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