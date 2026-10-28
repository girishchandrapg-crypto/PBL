import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Assignment, AssignmentSubmission, Subject, Course } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  FileText,
  Calendar,
  Clock,
  Plus,
  Paperclip,
  CheckCircle2,
  Upload,
  Eye,
  FileCheck,
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { role, isAdmin, isTeacher, isStudent, user } = useAuth();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    subjectId: 1,
    courseId: 1,
    semester: 3,
    teacherId: 1,
    dueDate: '2025-05-15',
    maxScore: 100,
    attachmentName: 'assignment_project_brief.pdf',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Student Submit Modal
  const [submitAssignmentTarget, setSubmitAssignmentTarget] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('My_Assignment_Solution.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // View Submissions Modal (for Teachers & Admin)
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState<Assignment | null>(null);
  const [submissionsList, setSubmissionsList] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assigns, courseList, subjectList] = await Promise.all([
        api.getAssignments(),
        api.getCourses(),
        api.getSubjects(),
      ]);
      setAssignments(assigns);
      setCourses(courseList);
      setSubjects(subjectList);
      if (courseList.length > 0) setCreateForm((f) => ({ ...f, courseId: courseList[0].id }));
      if (subjectList.length > 0) setCreateForm((f) => ({ ...f, subjectId: subjectList[0].id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await api.createAssignment(createForm);
      setShowCreateModal(false);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitAssignmentTarget) return;
    try {
      setIsSubmitting(true);
      await api.submitAssignment(submitAssignmentTarget.id, {
        studentId: user?.studentProfile?.id || 1,
        content: submissionContent,
        fileName: submissionFileName,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmitAssignmentTarget(null);
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSubmissions = async (assignment: Assignment) => {
    setViewSubmissionsAssignment(assignment);
    try {
      setLoadingSubmissions(true);
      const list = await api.getSubmissions(assignment.id);
      setSubmissionsList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Assignments & Tasks</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coursework, laboratory projects, deliverables, and student submission tracking.
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </button>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {assignment.subjectCode} - {assignment.subjectName}
                </span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due {assignment.dueDate}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{assignment.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{assignment.description}</p>

              {assignment.attachmentName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>{assignment.attachmentName}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Instructor: <strong className="text-slate-800">{assignment.teacherName}</strong>
              </div>

              <div className="flex items-center gap-2">
                {!isStudent && (
                  <button
                    onClick={() => handleOpenSubmissions(assignment)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Submissions
                  </button>
                )}

                {isStudent && (
                  <button
                    onClick={() => setSubmitAssignmentTarget(assignment)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Submit Work
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Course Assignment"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Relational Normalization & SQL Queries"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions & Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe project specifications, grading criteria, and deliverables..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={createForm.subjectId}
                  onChange={(e) => setCreateForm({ ...createForm, subjectId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Score</label>
                <input
                  type="number"
                  value={createForm.maxScore}
                  onChange={(e) => setCreateForm({ ...createForm, maxScore: parseInt(e.target.value, 10) || 100 })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment File Name</label>
                <input
                  type="text"
                  placeholder="specification_brief.pdf"
                  value={createForm.attachmentName}
                  onChange={(e) => setCreateForm({ ...createForm, attachmentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isCreating ? 'Publishing...' : 'Publish Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Submit Modal */}
      {submitAssignmentTarget && (
        <Modal
          isOpen={!!submitAssignmentTarget}
          onClose={() => setSubmitAssignmentTarget(null)}
          title={`Submit: ${submitAssignmentTarget.title}`}
          subtitle={`Subject: ${submitAssignmentTarget.subjectName} • Due: ${submitAssignmentTarget.dueDate}`}
          maxWidth="md"
        >
          {submitSuccess ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Assignment Submitted Successfully!</h4>
              <p className="text-xs text-slate-500">Your solution has been submitted to the faculty grading portal.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitSolution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Solution Notes & Comments
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Summarize your approach, code repository link, or lab outcomes..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attached Solution File</label>
                <input
                  type="text"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitAssignmentTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* View Submissions Modal */}
      {viewSubmissionsAssignment && (
        <Modal
          isOpen={!!viewSubmissionsAssignment}
          onClose={() => setViewSubmissionsAssignment(null)}
          title={`Student Submissions: ${viewSubmissionsAssignment.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {loadingSubmissions ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading submissions...</div>
            ) : submissionsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No submissions received for this assignment yet.
              </div>
            ) : (
              <div className="space-y-3">
                {submissionsList.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.studentName} ({sub.rollNumber})</span>
                      <span className="text-slate-400 text-[11px]">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700">{sub.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                      <span className="font-mono text-indigo-600">File: {sub.fileName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewSubmissionsAssignment(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
