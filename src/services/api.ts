import {
  Student,
  Teacher,
  Department,
  Course,
  Subject,
  AttendanceRecord,
  MarkRecord,
  FeeRecord,
  TimetableSlot,
  Assignment,
  AssignmentSubmission,
  Announcement,
  GradeSetting,
  User,
} from '../types/index.ts';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('campuscore_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, role?: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
  switchDemoRole: (role: string) =>
    request<{ token: string; user: User }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Dashboard
  getDashboardStats: () =>
    request<{
      totalStudents: number;
      totalTeachers: number;
      totalCourses: number;
      totalDepartments: number;
      presentStudentsToday: number;
      feeStats: { totalAmount: number; paidAmount: number; pendingAmount: number };
      studentsByDept: Array<{ name: string; fullName: string; count: number }>;
      studentsByYear: Array<{ year: string; count: number }>;
      recentAdmissions: Array<any>;
      recentAnnouncements: Announcement[];
    }>('/dashboard/stats'),

  // Students
  getStudents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
    });
    return request<{ students: Student[]; total: number }>(`/students?${query.toString()}`);
  },
  getStudentById: (id: number) =>
    request<Student & {
      marks: MarkRecord[];
      fees: FeeRecord[];
      attendance: AttendanceRecord[];
      attendanceStats: { totalDays: number; presentDays: number; absentDays: number; percentage: number };
    }>(`/students/${id}`),
  createStudent: (data: Partial<Student>) =>
    request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStudent: (id: number, data: Partial<Student>) =>
    request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: number) =>
    request<{ success: boolean; deleted: Student }>(`/students/${id}`, {
      method: 'DELETE',
    }),

  // Teachers
  getTeachers: () => request<Teacher[]>('/teachers'),
  createTeacher: (data: Partial<Teacher>) =>
    request<Teacher>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTeacher: (id: number, data: Partial<Teacher>) =>
    request<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTeacher: (id: number) =>
    request<{ success: boolean; deleted: Teacher }>(`/teachers/${id}`, {
      method: 'DELETE',
    }),

  // Departments & Courses & Subjects
  getDepartments: () => request<Department[]>('/departments'),
  createDepartment: (data: Partial<Department>) =>
    request<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCourses: () => request<Course[]>('/courses'),
  createCourse: (data: Partial<Course>) =>
    request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubjects: () => request<Subject[]>('/subjects'),
  createSubject: (data: Partial<Subject>) =>
    request<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Attendance
  getAttendance: (params: { subjectId?: number; date?: string; courseId?: number; studentId?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return request<AttendanceRecord[]>(`/attendance?${query.toString()}`);
  },
  recordAttendance: (records: Array<{
    studentId: number;
    subjectId: number;
    date: string;
    status: string;
    remarks?: string;
  }>) =>
    request<AttendanceRecord[]>('/attendance', {
      method: 'POST',
      body: JSON.stringify({ records }),
    }),

  // Marks & Grading
  getMarks: (params: { studentId?: number; subjectId?: number; semester?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return request<MarkRecord[]>(`/marks?${query.toString()}`);
  },
  recordMarks: (data: {
    studentId: number;
    subjectId: number;
    internalMarks: number;
    assignmentMarks: number;
    practicalMarks: number;
    midtermMarks: number;
    finalMarks: number;
    semester: number;
    maxMarks?: number;
  }) =>
    request<MarkRecord>('/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGradeSettings: () => request<GradeSetting[]>('/grades/settings'),
  updateGradeSetting: (id: number, data: Partial<GradeSetting>) =>
    request<GradeSetting>(`/grades/settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Fees
  getFees: (params: { studentId?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return request<FeeRecord[]>(`/fees?${query.toString()}`);
  },
  createFee: (data: Partial<FeeRecord>) =>
    request<FeeRecord>('/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordPayment: (id: number, amount: number, paymentMethod: string) =>
    request<FeeRecord>(`/fees/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ amount, paymentMethod }),
    }),

  // Timetable
  getTimetables: (params: { courseId?: number; semester?: number; section?: string; teacherId?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return request<TimetableSlot[]>(`/timetables?${query.toString()}`);
  },
  createTimetableSlot: (data: Partial<TimetableSlot>) =>
    request<TimetableSlot>('/timetables', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteTimetableSlot: (id: number) =>
    request<{ success: boolean }>(`/timetables/${id}`, {
      method: 'DELETE',
    }),

  // Assignments
  getAssignments: (params: { courseId?: number; semester?: number; teacherId?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return request<Assignment[]>(`/assignments?${query.toString()}`);
  },
  createAssignment: (data: Partial<Assignment>) =>
    request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submitAssignment: (assignmentId: number, data: { studentId: number; content?: string; fileName?: string }) =>
    request<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubmissions: (assignmentId: number) =>
    request<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`),

  // Announcements
  getAnnouncements: () => request<Announcement[]>('/announcements'),
  createAnnouncement: (data: Partial<Announcement>) =>
    request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteAnnouncement: (id: number) =>
    request<{ success: boolean }>(`/announcements/${id}`, {
      method: 'DELETE',
    }),
};
