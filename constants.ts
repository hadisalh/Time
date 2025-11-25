export const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
export const PERIODS_PER_DAY = 7;
export const PERIODS = Array.from({ length: PERIODS_PER_DAY }, (_, i) => `الحصة ${i + 1}`);

// Helper to generate unique IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);
