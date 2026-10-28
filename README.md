# CampusCore - University Student Management System (SMS)

A complete, production-grade, full-stack Student Management System built for colleges and universities. Powered by React 19, TypeScript, Tailwind CSS, Express.js REST API, and PostgreSQL via Cloud SQL.

---

## 🚀 Features & Modules

### 1. Multi-Role Authorization & Authentication
- **Admin**: Full system control — student admissions, editing, faculty roster, attendance tracking, marks & grade configuration, fee collection, timetable management, and reports.
- **Faculty / Teacher**: Roster viewing, daily/subject-wise attendance marking, marks & grading entry with automated GPA calculation, course assignment creation, and submission review.
- **Student**: Personalized portal — academic dossier, real-time attendance rate with circular indicators, transcripts & report card, fee dues & payment receipts, weekly timetable, and assignment submissions.
- **1-Click Demo Mode Switcher**: Seamlessly test Admin, Faculty, and Student interfaces directly from the top navigation bar or login screen.

### 2. Student Management & Admissions
- Complete student lifecycle management with 26 standardized fields (Student ID, Roll Number, Name, DOB, Gender, Email, Phone, Address, Department, Course, Year, Semester, Section, Parents, Emergency Contact, Profile Photo, Status).
- Dynamic search and multi-filtering (Department, Academic Year, Enrollment Status).
- Student Profile Dossier with dedicated tabs: Bio & Personal Info, Academic Standing, Attendance Log, Exam Marks, Fee Invoices, and Timetable.
- Export to CSV & Print-ready Student Roster.

### 3. Attendance Management
- Course, subject, and date-based attendance register.
- Batch operations: "All Present", "All Absent", or individual Present / Absent / Late / Excused toggles.
- Automatic percentage calculations with compliant (&gt;75%) visual badges.

### 4. Marks & Grading Engine
- Grade breakdown: Internal (20), Assignment (20), Practical (20), Midterm (25), Final Exam (15).
- Automated summation, percentage, letter grade assignment (A+, A, B+, B, C, D, F), and Pass/Fail status.
- Configurable Grade Point Scale editor for Administrators.

### 5. Fees Management & Receipts
- Tuition vouchers with Paid, Partially Paid, and Pending statuses.
- Real-time Fee Collection modal with automated receipt generation and print support.

### 6. Timetable & Weekly Schedules
- Interactive schedule grid for Monday through Friday with classrooms and instructors.
- Administrator slot creation modal with course and semester filters.

### 7. Assignments & Submissions
- Faculty assignment creation with attachments, instructions, due dates, and max scores.
- Student solution submission dialog with notes and file attachment tags.
- Submission review dialog for teachers.

### 8. Campus Noticeboard / Announcements
- University-wide circulars categorized by Academic, Exam, Event, Fees, and General.
- Priority indicators (High, Normal) and target audience filters.

### 9. Institutional Reports & Audits
- Instant printable and CSV exports for Student Rosters, Attendance Audits, Academic Performance, and Fee Reconciliation.

---

## 🔑 Demo Login Credentials

You can use the 1-Click Role Switcher buttons or sign in with:

| Role | Demo Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@campuscore.edu` | Full university administration, admissions, fees, settings |
| **Faculty** | `alan.vance@campuscore.edu` | Attendance marking, grade entry, coursework management |
| **Student** | `alex.turner@student.campuscore.edu` | Personal grades, attendance, timetable, fee vouchers |

---

## 🗄️ Database Architecture (PostgreSQL on Cloud SQL)

The system uses 14 relational tables with constraints and foreign keys:
- `users`: User authentication, Firebase UID, roles, and profiles.
- `departments`: Academic departments (CSE, ECE, IT).
- `courses`: Degree programs (B.Tech CSE, B.Tech ECE, B.Sc IT).
- `teachers`: Faculty records, qualifications, and department affiliations.
- `students`: 20 seeded student records with roll numbers and cohorts.
- `subjects`: Syllabus course units with credits and instructor linkages.
- `attendance`: Session attendance records.
- `marks`: Examination and continuous assessment records.
- `fees`: Student fee vouchers and payment ledger.
- `timetables`: Weekly classroom and lecture schedules.
- `assignments`: Homework, coursework, and projects.
- `assignment_submissions`: Student submission records.
- `announcements`: Campus circulars and bulletins.
- `grade_settings`: Configurable grade percentage boundaries.
