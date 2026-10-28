import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Subject, Student, MarkRecord, GradeSetting } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Award,
  CheckCircle2,
  Settings,
  Plus,
  Save,
  Search,
  BookOpen,
  Calculator,
  Sliders,
} from 'lucide-react';

export const MarksPage: React.FC = () => {
  const { role, isAdmin, isTeacher, isStudent, user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(3);

  const [marksList, setMarksList] = useState<MarkRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeSettings, setGradeSettings] = useState<GradeSetting[]>([]);

  const [loading, setLoading] = useState(true);

  // Edit / Enter Marks Modal
  const [activeModalStudent, setActiveModalStudent] = useState<Student | null>(null);
  const [markForm, setMarkForm] = useState({
    internalMarks: 18,
    assignmentMarks: 18,
    practicalMarks: 19,
    midtermMarks: 22,
    finalMarks: 14,
  });
  const [isSavingMark, setIsSavingMark] = useState(false);

  // Grade settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadSubjectsAndSettings();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadMarksAndCohort();
    }
  }, [selectedSubjectId, selectedSemester]);

  const loadSubjectsAndSettings = async () => {
    try {
      setLoading(true);
      const [subjList, settings] = await Promise.all([
        api.getSubjects(),
        api.getGradeSettings(),
      ]);
      setSubjects(subjList);
      setGradeSettings(settings);
      if (subjList.length > 0) {
        setSelectedSubjectId(subjList[0].id);
        setSelectedSemester(subjList[0].semester);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMarksAndCohort = async () => {
    try {
      setLoading(true);
      const currentSubj = subjects.find((s) => s.id === selectedSubjectId);
      const [marksData, studentsData] = await Promise.all([
        api.getMarks({ subjectId: selectedSubjectId, semester: selectedSemester }),
        api.getStudents({
          courseId: currentSubj?.courseId || 1,
          semester: selectedSemester,
          limit: 50,
        }),
      ]);
      setMarksList(marksData);
      setStudents(studentsData.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMarkModal = (student: Student) => {
    const existing = marksList.find((m) => m.studentId === student.id);
    if (existing) {
      setMarkForm({
        internalMarks: existing.internalMarks,
        assignmentMarks: existing.assignmentMarks,
        practicalMarks: existing.practicalMarks,
        midtermMarks: existing.midtermMarks,
        finalMarks: existing.finalMarks,
      });
    } else {
      setMarkForm({
        internalMarks: 16,
        assignmentMarks: 16,
        practicalMarks: 18,
        midtermMarks: 20,
        finalMarks: 12,
      });
    }
    setActiveModalStudent(student);
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalStudent) return;
    try {
      setIsSavingMark(true);
      await api.recordMarks({
        studentId: activeModalStudent.id,
        subjectId: selectedSubjectId,
        semester: selectedSemester,
        ...markForm,
      });
      setActiveModalStudent(null);
      await loadMarksAndCohort();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMark(false);
    }
  };

  const totalCalculated =
    markForm.internalMarks +
    markForm.assignmentMarks +
    markForm.practicalMarks +
    markForm.midtermMarks +
    markForm.finalMarks;

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marks & Grade Assessment</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GPA / Transcript Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter internal, practical, midterm and final examinations with automatic total, grade & pass/fail calculation.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            Grading Scale Settings
          </button>
        )}
      </div>

      {/* Subject and Semester Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const subId = parseInt(e.target.value, 10);
                setSelectedSubjectId(subId);
                const s = subjects.find((x) => x.id === subId);
                if (s) setSelectedSemester(s.semester);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.courseName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 w-full flex items-center justify-between text-xs">
              <span className="text-slate-500">Instructor:</span>
              <span className="font-semibold text-slate-800">
                {currentSubjectObj?.teacherName || 'Faculty Assigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Grade threshold preview pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="font-semibold text-slate-500">Grading Scale:</span>
          {gradeSettings.map((g) => (
            <span
              key={g.id}
              className="px-2 py-0.5 rounded bg-slate-100 font-mono font-medium text-slate-700"
            >
              {g.grade}: {g.minScore}-{g.maxScore}%
            </span>
          ))}
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-3 py-3.5 text-center">Internal (20)</th>
                <th className="px-3 py-3.5 text-center">Assign (20)</th>
                <th className="px-3 py-3.5 text-center">Practical (20)</th>
                <th className="px-3 py-3.5 text-center">Midterm (25)</th>
                <th className="px-3 py-3.5 text-center">Final (15)</th>
                <th className="px-3 py-3.5 text-center">Total (100)</th>
                <th className="px-3 py-3.5 text-center">Grade</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                {!isStudent && <th className="px-4 py-3.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-10 text-center text-slate-400">
                    No students found for this semester cohort.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const record = marksList.find((m) => m.studentId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                            {student.firstName[0]}
                          </div>
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">{record ? record.internalMarks : '-'}</td>
                      <td className="px-3 py-3.5 text-center">{record ? record.assignmentMarks : '-'}</td>
                      <td className="px-3 py-3.5 text-center">{record ? record.practicalMarks : '-'}</td>
                      <td className="px-3 py-3.5 text-center">{record ? record.midtermMarks : '-'}</td>
                      <td className="px-3 py-3.5 text-center">{record ? record.finalMarks : '-'}</td>
                      <td className="px-3 py-3.5 text-center font-bold text-slate-900">
                        {record ? record.totalMarks : '-'}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {record ? (
                          <span className="px-2 py-0.5 rounded font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {record.grade}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {record ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              record.status === 'Pass'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {record.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      {!isStudent && (
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenMarkModal(student)}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            {record ? 'Edit Score' : 'Enter Score'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Marks Modal */}
      {activeModalStudent && (
        <Modal
          isOpen={!!activeModalStudent}
          onClose={() => setActiveModalStudent(null)}
          title={`Enter Marks: ${activeModalStudent.firstName} ${activeModalStudent.lastName}`}
          subtitle={`${currentSubjectObj?.name} (${currentSubjectObj?.code}) • Roll: ${activeModalStudent.rollNumber}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveMarks} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Marks (Max 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={markForm.internalMarks}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, internalMarks: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Marks (Max 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={markForm.assignmentMarks}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, assignmentMarks: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Practical Marks (Max 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={markForm.practicalMarks}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, practicalMarks: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Midterm Marks (Max 25)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  required
                  value={markForm.midtermMarks}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, midtermMarks: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Final Exam Marks (Max 15)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  required
                  value={markForm.finalMarks}
                  onChange={(e) =>
                    setMarkForm({ ...markForm, finalMarks: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-indigo-700">Calculated Total</div>
                  <div className="text-xl font-extrabold text-indigo-900">{totalCalculated} / 100</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingMark}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSavingMark ? 'Saving...' : 'Save & Grade'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Grade Scale Settings Modal */}
      {showSettingsModal && (
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Grading Criteria & Grade Point Thresholds"
          subtitle="Configure percentage cutoffs for automated grade calculation"
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              {gradeSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                      {setting.grade}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">
                        {setting.minScore}% - {setting.maxScore}%
                      </div>
                      <div className="text-slate-500 text-[11px]">{setting.description}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      setting.isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {setting.isPass ? 'Passing' : 'Failing'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Close Settings
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
