import { ClassGroup, Teacher, Allocation, ScheduleResult, ScheduleItem, TimeSlot } from '../types';
import { DAYS } from '../constants';

// Helper: Shuffle array for randomness
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Check if a teacher is free
const isTeacherAvailable = (
  teacher: Teacher,
  day: number,
  period: number,
  currentSchedule: ScheduleItem[]
): boolean => {
  // 1. Explicit unavailable times
  const unavailableSlots = teacher.unavailableSlots || [];
  const isUnavailable = unavailableSlots.some(
    (slot) => slot.dayIndex === day && slot.periodIndex === period
  );
  if (isUnavailable) return false;

  // 2. Already booked in this slot
  const isBooked = currentSchedule.some(
    (item) => item.teacherId === teacher.id && item.dayIndex === day && item.periodIndex === period
  );
  if (isBooked) return false;

  return true;
};

// Check if a class is free
const isClassFree = (
  classId: string,
  day: number,
  period: number,
  currentSchedule: ScheduleItem[]
): boolean => {
  return !currentSchedule.some(
    (item) => item.classId === classId && item.dayIndex === day && item.periodIndex === period
  );
};

// Check distribution (Try to avoid same subject on same day for a class)
const hasSubjectOnDay = (
  classId: string,
  subjectId: string,
  day: number,
  currentSchedule: ScheduleItem[]
): boolean => {
  return currentSchedule.some(
    item => item.classId === classId && item.subjectId === subjectId && item.dayIndex === day
  );
};

export const generateSmartSchedule = (
  classes: ClassGroup[],
  teachers: Teacher[],
  allocations: Allocation[],
  periodsPerDay: number
): ScheduleResult => {
  // --- STEP 0: SANITIZE DATA ---
  // Remove allocations that point to deleted classes or teachers to prevent crashes
  const validAllocations = allocations.filter(a => {
      const classExists = classes.some(c => c.id === a.classId);
      const teacherExists = teachers.some(t => t.id === a.teacherId);
      const subjectExists = true; // Subjects are less critical for crash, but good to check if needed
      return classExists && teacherExists && subjectExists;
  });

  if (validAllocations.length === 0) {
      return { 
          items: [], 
          conflicts: ["لا توجد بيانات صالحة للتوزيع. تأكد من وجود مدرسين وصفوف وربطهم ببعض."], 
          success: false 
      };
  }

  let bestSchedule: ScheduleItem[] = [];
  let bestConflictCount = Infinity;
  let bestConflictsList: string[] = [];

  // --- STEP 1: VALIDATION ---
  const validationConflicts: string[] = [];
  teachers.forEach(t => {
    const assignedSessions = validAllocations
      .filter(a => a.teacherId === t.id)
      .reduce((sum, a) => sum + a.weeklySessions, 0);
    
    const unavailableSlots = t.unavailableSlots || [];
    const relevantUnavailable = unavailableSlots.filter(s => s.periodIndex < periodsPerDay);
    const availableSlotsCount = (DAYS.length * periodsPerDay) - relevantUnavailable.length;
    
    if (assignedSessions > t.maxSessionsPerWeek) {
      validationConflicts.push(`المدرس ${t.name} تجاوز الحد الأقصى للحصص (${assignedSessions}/${t.maxSessionsPerWeek}).`);
    }
    if (assignedSessions > availableSlotsCount) {
        validationConflicts.push(`المدرس ${t.name} مطلوب منه ${assignedSessions} حصة، ولكنه متاح فقط في ${availableSlotsCount} حصة.`);
    }
  });

  if (validationConflicts.length > 0) {
    return { items: [], conflicts: validationConflicts, success: false };
  }

  // --- STEP 2: PREPARE QUEUE ---
  let queue: { allocation: Allocation; teacher: Teacher }[] = [];
  
  validAllocations.forEach((alloc) => {
    const teacher = teachers.find((t) => t.id === alloc.teacherId);
    if (!teacher) return; 
    for (let i = 0; i < alloc.weeklySessions; i++) {
      queue.push({ allocation: alloc, teacher });
    }
  });

  // Heuristic Sort: Hardest items first
  queue.sort((a, b) => {
    const aSlots = a.teacher.unavailableSlots || [];
    const bSlots = b.teacher.unavailableSlots || [];
    const aUnavailable = aSlots.filter(s => s.periodIndex < periodsPerDay).length;
    const bUnavailable = bSlots.filter(s => s.periodIndex < periodsPerDay).length;
    
    // Primary: Who has fewer slots available?
    const diff = bUnavailable - aUnavailable;
    if (diff !== 0) return diff;

    // Secondary: Who has more sessions to teach?
    return b.allocation.weeklySessions - a.allocation.weeklySessions;
  });

  // --- STEP 3: GENERATION LOOP ---
  const MAX_ATTEMPTS = 50; 

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let currentSchedule: ScheduleItem[] = [];
    let currentConflicts: string[] = [];
    
    const attemptQueue = attempt === 0 ? [...queue] : shuffleArray([...queue]);

    for (const item of attemptQueue) {
      let placed = false;
      
      const allSlots: TimeSlot[] = [];
      for(let d=0; d<DAYS.length; d++) {
        for(let p=0; p<periodsPerDay; p++) {
          allSlots.push({ dayIndex: d, periodIndex: p });
        }
      }
      
      // Smart Sort for slots
      const preferredSlots = shuffleArray(allSlots).sort((a, b) => {
          // Rule 1: Distribute subjects (don't put Math twice on Monday if possible)
          const aHas = hasSubjectOnDay(item.allocation.classId, item.allocation.subjectId, a.dayIndex, currentSchedule);
          const bHas = hasSubjectOnDay(item.allocation.classId, item.allocation.subjectId, b.dayIndex, currentSchedule);
          return (aHas === bHas) ? 0 : aHas ? 1 : -1;
      });

      for (const slot of preferredSlots) {
        const { dayIndex, periodIndex } = slot;

        if (
          isClassFree(item.allocation.classId, dayIndex, periodIndex, currentSchedule) &&
          isTeacherAvailable(item.teacher, dayIndex, periodIndex, currentSchedule)
        ) {
          currentSchedule.push({
            id: Math.random().toString(36),
            classId: item.allocation.classId,
            subjectId: item.allocation.subjectId,
            teacherId: item.allocation.teacherId,
            dayIndex,
            periodIndex,
          });
          placed = true;
          break;
        }
      }

      if (!placed) {
        currentConflicts.push(`تعذر تعيين حصة ${item.allocation.subjectId} للصف ${item.allocation.classId} مع المدرس ${item.teacher.name}`);
      }
    }

    if (currentConflicts.length === 0) {
      return { items: currentSchedule, conflicts: [], success: true, timestamp: Date.now() };
    }

    if (currentConflicts.length < bestConflictCount) {
        bestConflictCount = currentConflicts.length;
        bestSchedule = currentSchedule;
        bestConflictsList = currentConflicts;
    }
  }

  return { 
      items: bestSchedule, 
      conflicts: ["لم يتم العثور على حل خالٍ تماماً من التعارضات. النتيجة الأفضل:", ...bestConflictsList], 
      success: false,
      timestamp: Date.now()
  };
};