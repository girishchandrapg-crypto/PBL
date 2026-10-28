import { eq, desc, asc, and, or, sql, like } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  students,
  teachers,
  departments,
  courses,
  subjects,
  attendance,
  marks,
  fees,
  timetables,
  assignments,
  assignmentSubmissions,
  announcements,
  gradeSettings,
} from './schema.ts';

// Sanitize errors helper
function sanitizeError(msg: string, err: unknown): never {
  console.error(msg, err);
  throw new Error(`${msg}. Please try again later.`, { cause: err });
}

// ================= USERS & AUTH =================
export async function getUserByEmail(email: string) {
  try {
    const res = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return res[0] || null;
  } catch (error) {
    sanitizeError('Failed to fetch user by email', error);
  }
}

export async function getUserById(id: number) {
  try {
    const res = await db.select().from(users).where(eq(users.id, id));
    return res[0] || null;
  } catch (error) {
    sanitizeError('Failed to fetch user by id', error);
  }
}

export async function upsertUser(data: { uid: string; email: string; name: string; role?: string; avatar?: string }) {
  try {
    const res = await db.insert(users)
      .values({
        uid: data.uid,
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role || 'student',
        avatar: data.avatar || null,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: data.name,
          avatar: data.avatar || null,
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to upsert user', error);
  }
}

// ================= DASHBOARD METRICS =================
export async function getDashboardStats() {
  try {
    const totalStudentsResult = await db.select({ count: sql<number>`count(*)` }).from(students);
    const totalTeachersResult = await db.select({ count: sql<number>`count(*)` }).from(teachers);
    const totalCoursesResult = await db.select({ count: sql<number>`count(*)` }).from(courses);
    const totalDepartmentsResult = await db.select({ count: sql<number>`count(*)` }).from(departments);

    const todayDate = new Date().toISOString().split('T')[0];
    const presentTodayResult = await db.select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(and(eq(attendance.date, todayDate), eq(attendance.status, 'Present')));

    const totalFeesResult = await db.select({
      total: sql<number>`COALESCE(sum(${fees.totalAmount}), 0)`,
      paid: sql<number>`COALESCE(sum(${fees.paidAmount}), 0)`,
      pending: sql<number>`COALESCE(sum(${fees.pendingAmount}), 0)`,
    }).from(fees);

    const studentsByDeptResult = await db.select({
      departmentId: students.departmentId,
      departmentName: departments.name,
      departmentCode: departments.code,
      count: sql<number>`count(${students.id})`,
    })
      .from(students)
      .leftJoin(departments, eq(students.departmentId, departments.id))
      .groupBy(students.departmentId, departments.name, departments.code);

    const studentsByYearResult = await db.select({
      year: students.year,
      count: sql<number>`count(*)`,
    }).from(students).groupBy(students.year).orderBy(asc(students.year));

    const recentAdmissions = await db.select({
      id: students.id,
      studentId: students.studentId,
      firstName: students.firstName,
      lastName: students.lastName,
      email: students.email,
      admissionDate: students.admissionDate,
      status: students.status,
      courseName: courses.name,
      departmentCode: departments.code,
    })
      .from(students)
      .leftJoin(courses, eq(students.courseId, courses.id))
      .leftJoin(departments, eq(students.departmentId, departments.id))
      .orderBy(desc(students.admissionDate))
      .limit(5);

    const recentAnnouncements = await db.select()
      .from(announcements)
      .orderBy(desc(announcements.publishedDate))
      .limit(4);

    return {
      totalStudents: Number(totalStudentsResult[0]?.count || 0),
      totalTeachers: Number(totalTeachersResult[0]?.count || 0),
      totalCourses: Number(totalCoursesResult[0]?.count || 0),
      totalDepartments: Number(totalDepartmentsResult[0]?.count || 0),
      presentStudentsToday: Number(presentTodayResult[0]?.count || 0),
      feeStats: {
        totalAmount: Number(totalFeesResult[0]?.total || 0),
        paidAmount: Number(totalFeesResult[0]?.paid || 0),
        pendingAmount: Number(totalFeesResult[0]?.pending || 0),
      },
      studentsByDept: studentsByDeptResult.map(d => ({
        name: d.departmentCode || d.departmentName || 'Unknown',
        fullName: d.departmentName,
        count: Number(d.count),
      })),
      studentsByYear: studentsByYearResult.map(y => ({
        year: `Year ${y.year}`,
        count: Number(y.count),
      })),
      recentAdmissions,
      recentAnnouncements,
    };
  } catch (error) {
    sanitizeError('Failed to fetch dashboard stats', error);
  }
}

// ================= STUDENTS =================
export async function getStudents(filters: {
  search?: string;
  departmentId?: number;
  courseId?: number;
  year?: number;
  semester?: number;
  section?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select({
      id: students.id,
      studentId: students.studentId,
      userId: students.userId,
      firstName: students.firstName,
      lastName: students.lastName,
      dateOfBirth: students.dateOfBirth,
      gender: students.gender,
      email: students.email,
      phone: students.phone,
      address: students.address,
      city: students.city,
      state: students.state,
      pincode: students.pincode,
      profilePhoto: students.profilePhoto,
      admissionDate: students.admissionDate,
      courseId: students.courseId,
      departmentId: students.departmentId,
      year: students.year,
      semester: students.semester,
      section: students.section,
      rollNumber: students.rollNumber,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      emergencyContact: students.emergencyContact,
      status: students.status,
      createdAt: students.createdAt,
      courseName: courses.name,
      courseCode: courses.code,
      departmentName: departments.name,
      departmentCode: departments.code,
    })
      .from(students)
      .leftJoin(courses, eq(students.courseId, courses.id))
      .leftJoin(departments, eq(students.departmentId, departments.id))
      .$dynamic();

    const conditions = [];

    if (filters.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${students.firstName}) LIKE ${term}`,
          sql`LOWER(${students.lastName}) LIKE ${term}`,
          sql`LOWER(${students.studentId}) LIKE ${term}`,
          sql`LOWER(${students.rollNumber}) LIKE ${term}`,
          sql`LOWER(${students.email}) LIKE ${term}`
        )
      );
    }

    if (filters.departmentId) conditions.push(eq(students.departmentId, filters.departmentId));
    if (filters.courseId) conditions.push(eq(students.courseId, filters.courseId));
    if (filters.year) conditions.push(eq(students.year, filters.year));
    if (filters.semester) conditions.push(eq(students.semester, filters.semester));
    if (filters.section) conditions.push(eq(students.section, filters.section));
    if (filters.status) conditions.push(eq(students.status, filters.status));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const list = await query.orderBy(asc(students.rollNumber)).limit(limit).offset(offset);

    // Total count query
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(students)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      students: list,
      total: Number(countResult[0]?.count || 0),
    };
  } catch (error) {
    sanitizeError('Failed to fetch students', error);
  }
}

export async function getStudentById(id: number) {
  try {
    const res = await db.select({
      id: students.id,
      studentId: students.studentId,
      userId: students.userId,
      firstName: students.firstName,
      lastName: students.lastName,
      dateOfBirth: students.dateOfBirth,
      gender: students.gender,
      email: students.email,
      phone: students.phone,
      address: students.address,
      city: students.city,
      state: students.state,
      pincode: students.pincode,
      profilePhoto: students.profilePhoto,
      admissionDate: students.admissionDate,
      courseId: students.courseId,
      departmentId: students.departmentId,
      year: students.year,
      semester: students.semester,
      section: students.section,
      rollNumber: students.rollNumber,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      emergencyContact: students.emergencyContact,
      status: students.status,
      createdAt: students.createdAt,
      courseName: courses.name,
      courseCode: courses.code,
      departmentName: departments.name,
      departmentCode: departments.code,
    })
      .from(students)
      .leftJoin(courses, eq(students.courseId, courses.id))
      .leftJoin(departments, eq(students.departmentId, departments.id))
      .where(eq(students.id, id));

    if (!res[0]) return null;
    const student = res[0];

    // Fetch related records
    const studentMarks = await db.select({
      id: marks.id,
      subjectId: marks.subjectId,
      internalMarks: marks.internalMarks,
      assignmentMarks: marks.assignmentMarks,
      practicalMarks: marks.practicalMarks,
      midtermMarks: marks.midtermMarks,
      finalMarks: marks.finalMarks,
      totalMarks: marks.totalMarks,
      maxMarks: marks.maxMarks,
      percentage: marks.percentage,
      grade: marks.grade,
      status: marks.status,
      semester: marks.semester,
      academicYear: marks.academicYear,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      credits: subjects.credits,
    })
      .from(marks)
      .leftJoin(subjects, eq(marks.subjectId, subjects.id))
      .where(eq(marks.studentId, id))
      .orderBy(desc(marks.semester));

    const studentFees = await db.select()
      .from(fees)
      .where(eq(fees.studentId, id))
      .orderBy(desc(fees.dueDate));

    const studentAttendance = await db.select({
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      subjectId: attendance.subjectId,
      subjectName: subjects.name,
      subjectCode: subjects.code,
    })
      .from(attendance)
      .leftJoin(subjects, eq(attendance.subjectId, subjects.id))
      .where(eq(attendance.studentId, id))
      .orderBy(desc(attendance.date));

    // Attendance stats
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return {
      ...student,
      marks: studentMarks,
      fees: studentFees,
      attendance: studentAttendance,
      attendanceStats: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: attendancePercentage,
      },
    };
  } catch (error) {
    sanitizeError('Failed to fetch student details', error);
  }
}

export async function createStudent(data: typeof students.$inferInsert) {
  try {
    const res = await db.insert(students).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create student', error);
  }
}

export async function updateStudent(id: number, data: Partial<typeof students.$inferInsert>) {
  try {
    const res = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to update student', error);
  }
}

export async function deleteStudent(id: number) {
  try {
    // Delete cascading references first
    await db.delete(attendance).where(eq(attendance.studentId, id));
    await db.delete(marks).where(eq(marks.studentId, id));
    await db.delete(fees).where(eq(fees.studentId, id));
    await db.delete(assignmentSubmissions).where(eq(assignmentSubmissions.studentId, id));
    const res = await db.delete(students).where(eq(students.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to delete student', error);
  }
}

// ================= TEACHERS =================
export async function getTeachers() {
  try {
    return await db.select({
      id: teachers.id,
      teacherId: teachers.teacherId,
      userId: teachers.userId,
      name: teachers.name,
      email: teachers.email,
      phone: teachers.phone,
      departmentId: teachers.departmentId,
      qualification: teachers.qualification,
      joiningDate: teachers.joiningDate,
      status: teachers.status,
      avatar: teachers.avatar,
      departmentName: departments.name,
      departmentCode: departments.code,
    })
      .from(teachers)
      .leftJoin(departments, eq(teachers.departmentId, departments.id))
      .orderBy(asc(teachers.name));
  } catch (error) {
    sanitizeError('Failed to fetch teachers', error);
  }
}

export async function createTeacher(data: typeof teachers.$inferInsert) {
  try {
    const res = await db.insert(teachers).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create teacher', error);
  }
}

export async function updateTeacher(id: number, data: Partial<typeof teachers.$inferInsert>) {
  try {
    const res = await db.update(teachers).set(data).where(eq(teachers.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to update teacher', error);
  }
}

export async function deleteTeacher(id: number) {
  try {
    const res = await db.delete(teachers).where(eq(teachers.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to delete teacher', error);
  }
}

// ================= DEPARTMENTS & COURSES & SUBJECTS =================
export async function getDepartments() {
  try {
    return await db.select().from(departments).orderBy(asc(departments.name));
  } catch (error) {
    sanitizeError('Failed to fetch departments', error);
  }
}

export async function createDepartment(data: typeof departments.$inferInsert) {
  try {
    const res = await db.insert(departments).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create department', error);
  }
}

export async function getCourses() {
  try {
    return await db.select({
      id: courses.id,
      departmentId: courses.departmentId,
      name: courses.name,
      code: courses.code,
      duration: courses.duration,
      description: courses.description,
      totalSemesters: courses.totalSemesters,
      departmentName: departments.name,
      departmentCode: departments.code,
    })
      .from(courses)
      .leftJoin(departments, eq(courses.departmentId, departments.id))
      .orderBy(asc(courses.name));
  } catch (error) {
    sanitizeError('Failed to fetch courses', error);
  }
}

export async function createCourse(data: typeof courses.$inferInsert) {
  try {
    const res = await db.insert(courses).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create course', error);
  }
}

export async function getSubjects() {
  try {
    return await db.select({
      id: subjects.id,
      code: subjects.code,
      name: subjects.name,
      courseId: subjects.courseId,
      semester: subjects.semester,
      teacherId: subjects.teacherId,
      credits: subjects.credits,
      courseName: courses.name,
      teacherName: teachers.name,
    })
      .from(subjects)
      .leftJoin(courses, eq(subjects.courseId, courses.id))
      .leftJoin(teachers, eq(subjects.teacherId, teachers.id))
      .orderBy(asc(subjects.code));
  } catch (error) {
    sanitizeError('Failed to fetch subjects', error);
  }
}

export async function createSubject(data: typeof subjects.$inferInsert) {
  try {
    const res = await db.insert(subjects).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create subject', error);
  }
}

// ================= ATTENDANCE =================
export async function getAttendanceRecords(filter: {
  subjectId?: number;
  date?: string;
  courseId?: number;
  studentId?: number;
}) {
  try {
    let query = db.select({
      id: attendance.id,
      studentId: attendance.studentId,
      subjectId: attendance.subjectId,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentCode: students.studentId,
      rollNumber: students.rollNumber,
      subjectName: subjects.name,
      subjectCode: subjects.code,
    })
      .from(attendance)
      .leftJoin(students, eq(attendance.studentId, students.id))
      .leftJoin(subjects, eq(attendance.subjectId, subjects.id))
      .$dynamic();

    const conditions = [];
    if (filter.subjectId) conditions.push(eq(attendance.subjectId, filter.subjectId));
    if (filter.date) conditions.push(eq(attendance.date, filter.date));
    if (filter.studentId) conditions.push(eq(attendance.studentId, filter.studentId));
    if (filter.courseId) conditions.push(eq(students.courseId, filter.courseId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(attendance.date), asc(students.rollNumber));
  } catch (error) {
    sanitizeError('Failed to fetch attendance', error);
  }
}

export async function recordAttendance(records: Array<{
  studentId: number;
  subjectId: number;
  date: string;
  status: string;
  remarks?: string;
  markedBy?: number;
}>) {
  try {
    const results = [];
    for (const record of records) {
      // Check existing attendance for this student/subject/date
      const existing = await db.select().from(attendance).where(
        and(
          eq(attendance.studentId, record.studentId),
          eq(attendance.subjectId, record.subjectId),
          eq(attendance.date, record.date)
        )
      );

      if (existing.length > 0) {
        const updated = await db.update(attendance)
          .set({
            status: record.status,
            remarks: record.remarks || existing[0].remarks,
            markedBy: record.markedBy || existing[0].markedBy,
          })
          .where(eq(attendance.id, existing[0].id))
          .returning();
        results.push(updated[0]);
      } else {
        const inserted = await db.insert(attendance).values(record).returning();
        results.push(inserted[0]);
      }
    }
    return results;
  } catch (error) {
    sanitizeError('Failed to record attendance', error);
  }
}

// ================= MARKS & GRADES =================
export async function getMarks(filter: { studentId?: number; subjectId?: number; semester?: number }) {
  try {
    let query = db.select({
      id: marks.id,
      studentId: marks.studentId,
      subjectId: marks.subjectId,
      internalMarks: marks.internalMarks,
      assignmentMarks: marks.assignmentMarks,
      practicalMarks: marks.practicalMarks,
      midtermMarks: marks.midtermMarks,
      finalMarks: marks.finalMarks,
      totalMarks: marks.totalMarks,
      maxMarks: marks.maxMarks,
      percentage: marks.percentage,
      grade: marks.grade,
      status: marks.status,
      semester: marks.semester,
      academicYear: marks.academicYear,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentCode: students.studentId,
      rollNumber: students.rollNumber,
      subjectName: subjects.name,
      subjectCode: subjects.code,
    })
      .from(marks)
      .leftJoin(students, eq(marks.studentId, students.id))
      .leftJoin(subjects, eq(marks.subjectId, subjects.id))
      .$dynamic();

    const conditions = [];
    if (filter.studentId) conditions.push(eq(marks.studentId, filter.studentId));
    if (filter.subjectId) conditions.push(eq(marks.subjectId, filter.subjectId));
    if (filter.semester) conditions.push(eq(marks.semester, filter.semester));

    if (conditions.length > 0) query = query.where(and(...conditions));

    return await query.orderBy(asc(students.rollNumber));
  } catch (error) {
    sanitizeError('Failed to fetch marks', error);
  }
}

export async function calculateGrade(total: number, max: number = 100) {
  const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
  const settings = await db.select().from(gradeSettings).orderBy(desc(gradeSettings.minScore));

  let assignedGrade = 'F';
  let isPass = false;

  for (const s of settings) {
    if (percentage >= s.minScore && percentage <= s.maxScore) {
      assignedGrade = s.grade;
      isPass = s.isPass === 1;
      break;
    }
  }

  // Fallback default
  if (!assignedGrade) {
    if (percentage >= 90) assignedGrade = 'A+';
    else if (percentage >= 80) assignedGrade = 'A';
    else if (percentage >= 70) assignedGrade = 'B+';
    else if (percentage >= 60) assignedGrade = 'B';
    else if (percentage >= 50) assignedGrade = 'C';
    else if (percentage >= 40) assignedGrade = 'D';
    else assignedGrade = 'F';
    isPass = percentage >= 40;
  }

  return { percentage, grade: assignedGrade, status: isPass ? 'Pass' : 'Fail' };
}

export async function upsertMarks(data: {
  studentId: number;
  subjectId: number;
  internalMarks: number;
  assignmentMarks: number;
  practicalMarks: number;
  midtermMarks: number;
  finalMarks: number;
  maxMarks?: number;
  semester: number;
  academicYear?: string;
}) {
  try {
    const total = data.internalMarks + data.assignmentMarks + data.practicalMarks + data.midtermMarks + data.finalMarks;
    const maxMarks = data.maxMarks || 100;
    const calc = await calculateGrade(total, maxMarks);

    const existing = await db.select().from(marks).where(
      and(
        eq(marks.studentId, data.studentId),
        eq(marks.subjectId, data.subjectId),
        eq(marks.semester, data.semester)
      )
    );

    const payload = {
      studentId: data.studentId,
      subjectId: data.subjectId,
      internalMarks: data.internalMarks,
      assignmentMarks: data.assignmentMarks,
      practicalMarks: data.practicalMarks,
      midtermMarks: data.midtermMarks,
      finalMarks: data.finalMarks,
      totalMarks: total,
      maxMarks,
      percentage: calc.percentage,
      grade: calc.grade,
      status: calc.status,
      semester: data.semester,
      academicYear: data.academicYear || '2024-2025',
    };

    if (existing.length > 0) {
      const updated = await db.update(marks).set(payload).where(eq(marks.id, existing[0].id)).returning();
      return updated[0];
    } else {
      const inserted = await db.insert(marks).values(payload).returning();
      return inserted[0];
    }
  } catch (error) {
    sanitizeError('Failed to save marks', error);
  }
}

export async function getGradeSettings() {
  try {
    return await db.select().from(gradeSettings).orderBy(desc(gradeSettings.minScore));
  } catch (error) {
    sanitizeError('Failed to fetch grade settings', error);
  }
}

export async function updateGradeSetting(id: number, data: Partial<typeof gradeSettings.$inferInsert>) {
  try {
    const res = await db.update(gradeSettings).set(data).where(eq(gradeSettings.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to update grade setting', error);
  }
}

// ================= FEES =================
export async function getFees(filter?: { studentId?: number; status?: string }) {
  try {
    let query = db.select({
      id: fees.id,
      studentId: fees.studentId,
      title: fees.title,
      totalAmount: fees.totalAmount,
      paidAmount: fees.paidAmount,
      pendingAmount: fees.pendingAmount,
      dueDate: fees.dueDate,
      paidDate: fees.paidDate,
      status: fees.status,
      receiptNumber: fees.receiptNumber,
      paymentMethod: fees.paymentMethod,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentCode: students.studentId,
      rollNumber: students.rollNumber,
      courseCode: courses.code,
    })
      .from(fees)
      .leftJoin(students, eq(fees.studentId, students.id))
      .leftJoin(courses, eq(students.courseId, courses.id))
      .$dynamic();

    const conditions = [];
    if (filter?.studentId) conditions.push(eq(fees.studentId, filter.studentId));
    if (filter?.status) conditions.push(eq(fees.status, filter.status));

    if (conditions.length > 0) query = query.where(and(...conditions));

    return await query.orderBy(desc(fees.dueDate));
  } catch (error) {
    sanitizeError('Failed to fetch fees', error);
  }
}

export async function createFee(data: typeof fees.$inferInsert) {
  try {
    const res = await db.insert(fees).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create fee', error);
  }
}

export async function recordPayment(feeId: number, payAmount: number, paymentMethod: string) {
  try {
    const existing = await db.select().from(fees).where(eq(fees.id, feeId));
    if (!existing[0]) throw new Error('Fee record not found');

    const fee = existing[0];
    const newPaid = fee.paidAmount + payAmount;
    const newPending = Math.max(0, fee.totalAmount - newPaid);
    const newStatus = newPending === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending';
    const receiptNumber = fee.receiptNumber || `REC-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const res = await db.update(fees).set({
      paidAmount: newPaid,
      pendingAmount: newPending,
      status: newStatus,
      paidDate: today,
      paymentMethod,
      receiptNumber,
    }).where(eq(fees.id, feeId)).returning();

    return res[0];
  } catch (error) {
    sanitizeError('Failed to record payment', error);
  }
}

// ================= TIMETABLE =================
export async function getTimetables(filter?: { courseId?: number; semester?: number; section?: string; teacherId?: number }) {
  try {
    let query = db.select({
      id: timetables.id,
      courseId: timetables.courseId,
      semester: timetables.semester,
      section: timetables.section,
      day: timetables.day,
      startTime: timetables.startTime,
      endTime: timetables.endTime,
      subjectId: timetables.subjectId,
      teacherId: timetables.teacherId,
      classroom: timetables.classroom,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      teacherName: teachers.name,
      courseName: courses.name,
      courseCode: courses.code,
    })
      .from(timetables)
      .leftJoin(subjects, eq(timetables.subjectId, subjects.id))
      .leftJoin(teachers, eq(timetables.teacherId, teachers.id))
      .leftJoin(courses, eq(timetables.courseId, courses.id))
      .$dynamic();

    const conditions = [];
    if (filter?.courseId) conditions.push(eq(timetables.courseId, filter.courseId));
    if (filter?.semester) conditions.push(eq(timetables.semester, filter.semester));
    if (filter?.section) conditions.push(eq(timetables.section, filter.section));
    if (filter?.teacherId) conditions.push(eq(timetables.teacherId, filter.teacherId));

    if (conditions.length > 0) query = query.where(and(...conditions));

    return await query.orderBy(asc(timetables.day), asc(timetables.startTime));
  } catch (error) {
    sanitizeError('Failed to fetch timetable', error);
  }
}

export async function createTimetableEntry(data: typeof timetables.$inferInsert) {
  try {
    const res = await db.insert(timetables).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to add timetable entry', error);
  }
}

export async function deleteTimetableEntry(id: number) {
  try {
    const res = await db.delete(timetables).where(eq(timetables.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to delete timetable entry', error);
  }
}

// ================= ASSIGNMENTS =================
export async function getAssignments(filter?: { courseId?: number; semester?: number; teacherId?: number }) {
  try {
    let query = db.select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      subjectId: assignments.subjectId,
      courseId: assignments.courseId,
      semester: assignments.semester,
      teacherId: assignments.teacherId,
      dueDate: assignments.dueDate,
      maxScore: assignments.maxScore,
      attachmentName: assignments.attachmentName,
      attachmentUrl: assignments.attachmentUrl,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      teacherName: teachers.name,
    })
      .from(assignments)
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .leftJoin(teachers, eq(assignments.teacherId, teachers.id))
      .$dynamic();

    const conditions = [];
    if (filter?.courseId) conditions.push(eq(assignments.courseId, filter.courseId));
    if (filter?.semester) conditions.push(eq(assignments.semester, filter.semester));
    if (filter?.teacherId) conditions.push(eq(assignments.teacherId, filter.teacherId));

    if (conditions.length > 0) query = query.where(and(...conditions));

    return await query.orderBy(desc(assignments.dueDate));
  } catch (error) {
    sanitizeError('Failed to fetch assignments', error);
  }
}

export async function createAssignment(data: typeof assignments.$inferInsert) {
  try {
    const res = await db.insert(assignments).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create assignment', error);
  }
}

export async function submitAssignment(data: typeof assignmentSubmissions.$inferInsert) {
  try {
    const res = await db.insert(assignmentSubmissions).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to submit assignment', error);
  }
}

export async function getSubmissions(assignmentId: number) {
  try {
    return await db.select({
      id: assignmentSubmissions.id,
      assignmentId: assignmentSubmissions.assignmentId,
      studentId: assignmentSubmissions.studentId,
      submittedAt: assignmentSubmissions.createdAt,
      content: assignmentSubmissions.content,
      fileName: assignmentSubmissions.fileName,
      status: assignmentSubmissions.status,
      score: assignmentSubmissions.score,
      feedback: assignmentSubmissions.feedback,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentCode: students.studentId,
      rollNumber: students.rollNumber,
    })
      .from(assignmentSubmissions)
      .leftJoin(students, eq(assignmentSubmissions.studentId, students.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.createdAt));
  } catch (error) {
    sanitizeError('Failed to fetch assignment submissions', error);
  }
}

// ================= ANNOUNCEMENTS =================
export async function getAnnouncements() {
  try {
    return await db.select().from(announcements).orderBy(desc(announcements.publishedDate));
  } catch (error) {
    sanitizeError('Failed to fetch announcements', error);
  }
}

export async function createAnnouncement(data: typeof announcements.$inferInsert) {
  try {
    const res = await db.insert(announcements).values(data).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to create announcement', error);
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    const res = await db.delete(announcements).where(eq(announcements.id, id)).returning();
    return res[0];
  } catch (error) {
    sanitizeError('Failed to delete announcement', error);
  }
}
