
export interface ClassGroup {
  id: string;
  name: string; // e.g., "الصف الخامس"
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  maxSessionsPerWeek: number;
  unavailableSlots: TimeSlot[]; // Array of times they cannot teach
  color?: string; // For visualization
}

// Definition of a subject (e.g., "Math", "Physics")
export interface Subject {
  id: string;
  name: string;
  color: string;
}

// The link between Class, Subject, and Teacher
export interface Allocation {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  weeklySessions: number;
}

export interface TimeSlot {
  dayIndex: number; // 0-4 (Sun-Thu)
  periodIndex: number; // 0-6 (1st-7th)
}

export interface ScheduleItem {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayIndex: number;
  periodIndex: number;
}

export interface ScheduleResult {
  items: ScheduleItem[];
  conflicts: string[];
  success: boolean;
  timestamp?: number;
}

export interface SchoolConfig {
    periodsPerDay: number;
}
