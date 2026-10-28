import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { TimetableSlot, Course, Subject, Teacher } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Calendar,
  Clock,
  Building,
  User,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const TimetablePage: React.FC = () => {
  const { role, isAdmin, isTeacher, isStudent } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [selectedSection, setSelectedSection] = useState<string>('A');

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Add slot modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    day: 'Monday' as (typeof DAYS)[number],
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    subjectId: 1,
    teacherId: 1,
    classroom: 'Hall 101',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadTimetable();
  }, [selectedCourseId, selectedSemester, selectedSection]);

  const loadMeta = async () => {
    try {
      const [cList, sList, tList] = await Promise.all([
        api.getCourses(),
        api.getSubjects(),
        api.getTeachers(),
      ]);
      setCourses(cList);
      setSubjects(sList);
      setTeachers(tList);
      if (cList.length > 0) setSelectedCourseId(cList[0].id);
      if (sList.length > 0) setSlotForm((f) => ({ ...f, subjectId: sList[0].id }));
      if (tList.length > 0) setSlotForm((f) => ({ ...f, teacherId: tList[0].id }));
    } catch (e) {
      console.error(e);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getTimetables({
        courseId: selectedCourseId,
        semester: selectedSemester,
        section: selectedSection,
      });
      setSlots(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createTimetableSlot({
        courseId: selectedCourseId,
        semester: selectedSemester,
        section: selectedSection,
        ...slotForm,
      });
      setShowAddModal(false);
      await loadTimetable();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await api.deleteTimetableSlot(id);
      await loadTimetable();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Class & Lecture Timetable</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Weekly lecture schedules, laboratories, instructor assignments, and classrooms.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Schedule Slot
          </button>
        )}
      </div>

      {/* Cohort Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Course Program</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day);
          return (
            <div
              key={day}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col"
            >
              {/* Day Header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{day}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {daySlots.length} Classes
                </span>
              </div>

              {/* Slots */}
              <div className="p-3 space-y-3 flex-1 min-h-[220px]">
                {daySlots.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4 text-[11px] text-slate-400">
                    No lectures scheduled
                  </div>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition-all group relative"
                    >
                      <div className="flex items-center justify-between text-[11px] text-indigo-600 font-bold mb-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" /> {slot.startTime} - {slot.endTime}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 rounded transition-opacity"
                            title="Remove slot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {slot.subjectName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{slot.subjectCode}</p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 truncate max-w-[90px]">{slot.teacherName}</span>
                        <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {slot.classroom}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Schedule New Lecture Slot"
          maxWidth="md"
        >
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
              <select
                value={slotForm.day}
                onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  required
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="text"
                  placeholder="10:30 AM"
                  required
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={slotForm.subjectId}
                onChange={(e) => setSlotForm({ ...slotForm, subjectId: parseInt(e.target.value, 10) })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor</label>
              <select
                value={slotForm.teacherId}
                onChange={(e) => setSlotForm({ ...slotForm, teacherId: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Hall / Room</label>
              <input
                type="text"
                placeholder="e.g. Turing Hall 101"
                required
                value={slotForm.classroom}
                onChange={(e) => setSlotForm({ ...slotForm, classroom: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
