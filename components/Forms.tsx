
import React, { useState } from 'react';
import { ClassGroup, Subject, Teacher, Allocation } from '../types';
import { DAYS } from '../constants';
import { Trash2, Plus, Clock, BookOpen, Users, CheckCircle, Settings, Save, Upload, Edit2, X, Search, AlertCircle, ChevronDown, Check, Minus } from 'lucide-react';

// --- HELPER: NUMBER STEPPER ---
const NumberStepper: React.FC<{
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    label?: string;
    suffix?: string;
}> = ({ value, onChange, min = 0, max = 100, label, suffix }) => {
    const handleIncrement = () => {
        if (value < max) onChange(value + 1);
    };
    const handleDecrement = () => {
        if (value > min) onChange(value - 1);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        if (!isNaN(val)) onChange(Math.min(Math.max(val, min), max));
    };

    return (
        <div className="w-full">
            {label && <label className="block text-xs md:text-sm font-bold text-slate-600 mb-1.5">{label}</label>}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-200 transition-all h-10 md:h-12">
                <button 
                    type="button"
                    onClick={handleDecrement}
                    className="w-10 md:w-12 h-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition active:bg-slate-200 border-l border-slate-100"
                >
                    <Minus size={18} strokeWidth={3} />
                </button>
                <div className="flex-1 flex items-center justify-center relative h-full">
                    <input 
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={value.toString()}
                        onChange={handleChange}
                        className="w-full h-full text-center font-black text-base md:text-lg text-slate-700 outline-none bg-transparent appearance-none" 
                    />
                    {suffix && <span className="absolute right-2 md:right-4 text-[10px] md:text-xs font-bold text-slate-400 pointer-events-none">{suffix}</span>}
                </div>
                <button 
                    type="button"
                    onClick={handleIncrement}
                    className="w-10 md:w-12 h-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition active:bg-slate-200 border-r border-slate-100"
                >
                    <Plus size={18} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

// --- PREMIUM MODAL ---
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 max-h-[90vh] flex flex-col border border-white/20">
        <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition p-1.5 rounded-full">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS FORM ---
export const SettingsForm: React.FC<{
    periodsPerDay: number;
    setPeriodsPerDay: (n: number) => void;
    onBackup: () => void;
    onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ periodsPerDay, setPeriodsPerDay, onBackup, onRestore }) => {
    return (
        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><Settings size={20}/></div>
                <h3 className="text-base md:text-lg font-bold text-slate-800">إعدادات النظام</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <NumberStepper 
                        label="عدد الحصص الدراسية يومياً"
                        value={periodsPerDay}
                        onChange={setPeriodsPerDay}
                        min={4}
                        max={12}
                        suffix="حصة"
                    />
                </div>

                <div className="flex flex-col justify-center gap-2 md:gap-3">
                    <label className="block text-xs md:text-sm font-bold text-slate-600">إدارة النسخ الاحتياطي</label>
                    <div className="flex gap-2 md:gap-3">
                        <button 
                            type="button"
                            onClick={onBackup}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-xl hover:bg-indigo-100 transition font-bold text-sm"
                        >
                            <Save size={16} /> حفظ البيانات
                        </button>
                        
                        <label className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-xl hover:bg-emerald-100 transition font-bold text-sm cursor-pointer">
                            <Upload size={16} /> استيراد
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={onRestore}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- CLASS FORM ---
export const ClassForm: React.FC<{
  classes: ClassGroup[];
  setClasses: React.Dispatch<React.SetStateAction<ClassGroup[]>>;
}> = ({ classes, setClasses }) => {
  const [name, setName] = useState('');
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setClasses([...classes, { id: Math.random().toString(36).substr(2, 9), name: name.trim() }]);
    setName('');
  };

  const updateClass = () => {
    if (!editingClass || !editingClass.name.trim()) return;
    setClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
    setEditingClass(null);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white h-full flex flex-col transition-all hover:shadow-2xl hover:shadow-indigo-100/50">
      <div className="flex items-center gap-2 md:gap-3 mb-4">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Users size={18} /></div>
        <h3 className="text-base md:text-lg font-bold text-slate-800">الصفوف الدراسية</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الصف (مثال: الخامس أ)"
          className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all placeholder-slate-400 font-medium text-sm md:text-base"
        />
        <button type="submit" className="bg-indigo-600 text-white w-10 md:w-12 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center shadow-lg shadow-indigo-200">
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-1 max-h-48 md:max-h-60 lg:max-h-[300px] space-y-2 custom-scrollbar">
            {classes.map((c) => (
            <div key={c.id} className="group flex justify-between items-center bg-white p-2.5 md:p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <span className="font-bold text-slate-700 mr-2 text-sm md:text-base">{c.name}</span>
                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setEditingClass(c)} className="text-blue-500 hover:bg-blue-50 p-1.5 md:p-2 rounded-lg transition"><Edit2 size={14} /></button>
                    <button type="button" onClick={() => setClasses(classes.filter(x => x.id !== c.id))} className="text-red-500 hover:bg-red-50 p-1.5 md:p-2 rounded-lg transition"><Trash2 size={14} /></button>
                </div>
            </div>
            ))}
            {classes.length === 0 && <div className="text-center py-6 md:py-10 text-slate-300 font-medium text-sm">لا توجد صفوف</div>}
      </div>

      <Modal isOpen={!!editingClass} onClose={() => setEditingClass(null)} title="تعديل اسم الصف">
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">الاسم الجديد</label>
                <input 
                    value={editingClass?.name || ''} 
                    onChange={e => setEditingClass(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                    autoFocus
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingClass(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition text-sm">إلغاء</button>
                <button type="button" onClick={updateClass} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition text-sm">حفظ</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

// --- SUBJECT FORM ---
export const SubjectForm: React.FC<{
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}> = ({ subjects, setSubjects }) => {
  const [name, setName] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubjects([...subjects, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: name.trim(), 
      color: colors[subjects.length % colors.length] 
    }]);
    setName('');
  };

  const updateSubject = () => {
      if(!editingSubject || !editingSubject.name.trim()) return;
      setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
      setEditingSubject(null);
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white h-full flex flex-col transition-all hover:shadow-2xl hover:shadow-purple-100/50">
      <div className="flex items-center gap-2 md:gap-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><BookOpen size={18} /></div>
        <h3 className="text-base md:text-lg font-bold text-slate-800">المواد الدراسية</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم المادة (مثال: رياضيات)"
          className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all placeholder-slate-400 font-medium text-sm md:text-base"
        />
        <button type="submit" className="bg-purple-600 text-white w-10 md:w-12 rounded-xl hover:bg-purple-700 transition flex items-center justify-center shadow-lg shadow-purple-200">
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-1 max-h-48 md:max-h-60 lg:max-h-[300px] space-y-2 custom-scrollbar">
            {subjects.map((s) => (
            <div key={s.id} className="group flex justify-between items-center bg-white p-2.5 md:p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-[10px] md:text-xs shadow-sm" style={{background: s.color}}>
                        {s.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700 text-sm md:text-base">{s.name}</span>
                </div>
                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setEditingSubject(s)} className="text-blue-500 hover:bg-blue-50 p-1.5 md:p-2 rounded-lg transition"><Edit2 size={14} /></button>
                    <button type="button" onClick={() => setSubjects(subjects.filter(x => x.id !== s.id))} className="text-red-500 hover:bg-red-50 p-1.5 md:p-2 rounded-lg transition"><Trash2 size={14} /></button>
                </div>
            </div>
            ))}
            {subjects.length === 0 && <div className="text-center py-6 md:py-10 text-slate-300 font-medium text-sm">لا توجد مواد</div>}
      </div>

      <Modal isOpen={!!editingSubject} onClose={() => setEditingSubject(null)} title="تخصيص المادة">
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">اسم المادة</label>
                <input 
                    value={editingSubject?.name || ''} 
                    onChange={e => setEditingSubject(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">لون التمييز</label>
                <div className="flex flex-wrap gap-3">
                    {colors.map(c => (
                        <button 
                            type="button"
                            key={c}
                            onClick={() => setEditingSubject(prev => prev ? {...prev, color: c} : null)}
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 transition-transform shadow-sm ${editingSubject?.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                            style={{backgroundColor: c}}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSubject(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition text-sm">إلغاء</button>
                <button type="button" onClick={updateSubject} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-200 transition text-sm">حفظ</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

// --- TEACHER FORM ---
export const TeacherForm: React.FC<{
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  periodsPerDay: number;
}> = ({ teachers, setTeachers, periodsPerDay }) => {
  const [name, setName] = useState('');
  const [maxLoad, setMaxLoad] = useState(24);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const addTeacher = () => {
    if (!name.trim()) return;
    setTeachers([...teachers, {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      specialty: '',
      maxSessionsPerWeek: maxLoad,
      unavailableSlots: []
    }]);
    setName('');
  };

  const updateTeacher = () => {
      if(!editingTeacher || !editingTeacher.name.trim()) return;
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
      setEditingTeacher(null);
  }

  const toggleSlot = (teacherId: string, day: number, period: number) => {
    setTeachers(teachers.map(t => {
      if (t.id !== teacherId) return t;
      const slots = Array.isArray(t.unavailableSlots) ? t.unavailableSlots : [];
      const exists = slots.some(s => s.dayIndex === day && s.periodIndex === period);
      return {
        ...t,
        unavailableSlots: exists 
          ? slots.filter(s => !(s.dayIndex === day && s.periodIndex === period))
          : [...slots, { dayIndex: day, periodIndex: period }]
      };
    }));
  };

  // Toggle entire day
  const toggleDay = (teacherId: string, dayIndex: number) => {
    setTeachers(teachers.map(t => {
      if (t.id !== teacherId) return t;
      const slots = Array.isArray(t.unavailableSlots) ? t.unavailableSlots : [];
      
      // Calculate how many distinct periods are blocked for this day
      const blockedPeriods = new Set(slots.filter(s => s.dayIndex === dayIndex).map(s => s.periodIndex));
      const allSelected = blockedPeriods.size >= periodsPerDay;

      let newSlots = [...slots];
      if (allSelected) {
        // Unselect all for this day
        newSlots = newSlots.filter(s => s.dayIndex !== dayIndex);
      } else {
        // Select all for this day
        for(let p=0; p<periodsPerDay; p++) {
             if(!newSlots.some(s => s.dayIndex === dayIndex && s.periodIndex === p)) {
                 newSlots.push({ dayIndex, periodIndex: p });
             }
        }
      }
      return { ...t, unavailableSlots: newSlots };
    }));
  };

  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white p-4 md:p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white mt-6 md:mt-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-emerald-100 p-2 md:p-2.5 rounded-xl text-emerald-600"><Users size={20} /></div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">سجل المدرسين</h3>
        </div>
        <div className="text-xs md:text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{teachers.length} مدرس</div>
      </div>
      
      {/* Add New Teacher */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 transition-colors hover:bg-slate-50/80">
        <h4 className="text-xs md:text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">إضافة مدرس جديد</h4>
        <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي"
                className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium h-10 md:h-12 text-sm md:text-base"
                />
            </div>
            <div className="w-full md:w-48">
                <NumberStepper 
                    value={maxLoad}
                    onChange={setMaxLoad}
                    min={1}
                    max={40}
                    suffix="نصاب"
                />
            </div>
            <button type="button" onClick={addTeacher} className="bg-emerald-600 text-white px-5 h-10 md:h-12 rounded-xl hover:bg-emerald-700 w-full md:w-auto flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-200 transition text-sm md:text-base">
            <Plus size={18} /> إضافة
            </button>
        </div>
      </div>

      <div className="mb-4 relative">
          <Search className="absolute right-3.5 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن مدرس بالاسم..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-transparent p-3 pr-10 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none transition-all text-sm md:text-base"
          />
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
        {filteredTeachers.map(t => {
          const slots = Array.isArray(t.unavailableSlots) ? t.unavailableSlots : [];
          return (
          <div key={t.id} className={`border rounded-2xl transition-all duration-300 overflow-hidden ${activeTeacherId === t.id ? 'ring-2 ring-emerald-500 border-transparent shadow-xl bg-white' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
            <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-white text-base md:text-lg shrink-0 shadow-md ${slots.length > 0 ? 'bg-amber-500' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'}`}>
                      {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-base md:text-lg">{t.name}</div>
                    <div className="text-xs md:text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">نصاب: {t.maxSessionsPerWeek}</span>
                        {t.specialty && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{t.specialty}</span>}
                    </div>
                  </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  type="button"
                  onClick={() => setEditingTeacher(t)}
                  className="flex-1 md:flex-none w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTeacherId(activeTeacherId === t.id ? null : t.id)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition ${activeTeacherId === t.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Clock size={16} /> {activeTeacherId === t.id ? 'إخفاء الأوقات' : 'أوقات الفراغ'}
                </button>
                <button type="button" onClick={() => setTeachers(teachers.filter(x => x.id !== t.id))} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition">
                    <Trash2 size={18}/>
                </button>
              </div>
            </div>
            
            {activeTeacherId === t.id && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-3 md:p-6 animate-fade-in">
                 <p className="text-[10px] md:text-xs text-slate-500 mb-3 text-center">انقر على <span className="font-bold text-slate-800">اسم اليوم</span> لتعطيل اليوم بالكامل (سيظهر باللون الأحمر)، أو انقر على المربعات لتحديد حصص محددة.</p>
                 <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-center text-xs md:text-sm border-collapse bg-white">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600">
                                <th className="p-2 md:p-3 border-b w-16 md:w-24">اليوم</th>
                                {Array.from({length: periodsPerDay}).map((_, i) => <th key={i} className="p-2 md:p-3 border-b font-bold text-slate-500">{i+1}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((d, dIdx) => {
                                // Check if whole day is blocked
                                const blockedCount = slots.filter(s => s.dayIndex === dIdx).length;
                                const isDayBlocked = blockedCount >= periodsPerDay;
                                
                                return (
                                <tr key={dIdx} className="hover:bg-slate-50">
                                    <td 
                                        onClick={() => toggleDay(t.id, dIdx)}
                                        className={`font-bold p-2 md:p-3 border-l cursor-pointer select-none transition-colors ${isDayBlocked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-50/50 text-slate-700 hover:bg-slate-200'}`}
                                        title={isDayBlocked ? "انقر لإلغاء حظر اليوم" : "انقر لحظر اليوم بالكامل"}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <span>{d}</span>
                                            {isDayBlocked && <Check size={14} className="opacity-75" strokeWidth={3} />}
                                        </div>
                                    </td>
                                    {Array.from({length: periodsPerDay}).map((_, pIdx) => {
                                        const isBusy = slots.some(s => s.dayIndex === dIdx && s.periodIndex === pIdx);
                                        return (
                                            <td key={pIdx} className="p-0.5 md:p-1 border-b border-slate-100">
                                                <button 
                                                    type="button"
                                                    onClick={() => toggleSlot(t.id, dIdx, pIdx)}
                                                    className={`w-full h-8 md:h-12 rounded-lg transition-all duration-200 flex items-center justify-center ${
                                                        isBusy 
                                                        ? 'bg-red-500 text-white shadow-inner scale-90' 
                                                        : 'hover:bg-emerald-50 text-slate-200 hover:text-emerald-400'
                                                    }`}
                                                >
                                                    {isBusy ? <X size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-200"></div>}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            )})}
                        </tbody>
                    </table>
                 </div>
              </div>
            )}
          </div>
          )})}
        {filteredTeachers.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">لا يوجد مدرسين بهذا الاسم</div>}
      </div>

       <Modal isOpen={!!editingTeacher} onClose={() => setEditingTeacher(null)} title="تعديل بيانات المدرس">
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">اسم المدرس</label>
                <input 
                    value={editingTeacher?.name || ''} 
                    onChange={e => setEditingTeacher(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">التخصص</label>
                <input 
                    value={editingTeacher?.specialty || ''} 
                    onChange={e => setEditingTeacher(prev => prev ? {...prev, specialty: e.target.value} : null)}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="مثال: لغة عربية"
                />
            </div>
            <div>
                <NumberStepper 
                    label="النصاب الأسبوعي"
                    value={editingTeacher?.maxSessionsPerWeek || 0}
                    onChange={v => setEditingTeacher(prev => prev ? {...prev, maxSessionsPerWeek: v} : null)}
                    min={1}
                    max={50}
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingTeacher(null)} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition text-sm">إلغاء</button>
                <button type="button" onClick={updateTeacher} className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 transition text-sm">حفظ</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

// --- ALLOCATION MANAGER ---
export const AllocationManager: React.FC<{
    classes: ClassGroup[];
    subjects: Subject[];
    teachers: Teacher[];
    allocations: Allocation[];
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
    periodsPerDay: number;
}> = ({ classes, subjects, teachers, allocations, setAllocations, periodsPerDay }) => {
    
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [sessions, setSessions] = useState(2);
    const [editingAlloc, setEditingAlloc] = useState<Allocation | null>(null);

    const addAllocation = () => {
        if (!selectedClassId || !selectedSubjectId || !selectedTeacherId) {
            alert("يرجى اختيار الصف والمادة والمدرس أولاً");
            return;
        }
        
        const exists = allocations.some(a => a.classId === selectedClassId && a.subjectId === selectedSubjectId);
        if (exists) {
            alert("هذه المادة مضافة بالفعل لهذا الصف.");
            return;
        }

        setAllocations([...allocations, {
            id: Math.random().toString(36).substr(2,9),
            classId: selectedClassId,
            subjectId: selectedSubjectId,
            teacherId: selectedTeacherId,
            weeklySessions: sessions
        }]);
    };

    const updateAllocation = () => {
        if(!editingAlloc) return;
        setAllocations(allocations.map(a => a.id === editingAlloc.id ? editingAlloc : a));
        setEditingAlloc(null);
    }

    const removeAllocation = (id: string) => {
        if(window.confirm('هل أنت متأكد من الحذف؟')) {
            setAllocations(allocations.filter(a => a.id !== id));
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white mt-6 md:mt-8 mb-20 md:mb-20">
             
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-6 rounded-2xl border border-orange-100 mb-6 md:mb-8 shadow-inner">
                <h4 className="text-xs md:text-sm font-bold text-orange-800 mb-4 flex items-center gap-2"><Plus size={16}/> إضافة ارتباط جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                    <div className="md:col-span-3">
                        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full p-3 md:p-4 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-400 outline-none font-medium h-12 md:h-14 text-sm md:text-base">
                            <option value="">اختر الصف...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="w-full p-3 md:p-4 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-400 outline-none font-medium h-12 md:h-14 text-sm md:text-base">
                            <option value="">اختر المادة...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)} className="w-full p-3 md:p-4 border border-orange-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-400 outline-none font-medium h-12 md:h-14 text-sm md:text-base">
                            <option value="">اختر المدرس...</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2 pb-1">
                         <NumberStepper 
                            value={sessions}
                            onChange={setSessions}
                            min={1}
                            max={12}
                            suffix="حصص"
                         />
                    </div>
                    <div className="md:col-span-1">
                        <button type="button" onClick={addAllocation} className="w-full h-12 md:h-[52px] bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition flex items-center justify-center shadow-lg shadow-orange-200">
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* List by Class */}
            <div className="space-y-6 md:space-y-8">
                {classes.map(c => {
                    const classAllocations = allocations.filter(a => a.classId === c.id);
                    if (classAllocations.length === 0) return null;
                    
                    const totalSessions = classAllocations.reduce((acc, curr) => acc + curr.weeklySessions, 0);
                    const maxSessions = DAYS.length * periodsPerDay;
                    const isFull = totalSessions > maxSessions;

                    return (
                        <div key={c.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                            <div className="bg-slate-50 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center border-b border-slate-100">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 md:gap-3 text-sm md:text-base">
                                    <span className="w-2 h-6 md:w-3 md:h-8 bg-indigo-500 rounded-full"></span>
                                    {c.name}
                                </h4>
                                <div className={`text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full border font-bold flex items-center gap-1 md:gap-2 ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                    {isFull && <AlertCircle size={12} />}
                                    {totalSessions} / {maxSessions} حصة
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                            <table className="w-full text-xs md:text-sm">
                                <thead className="bg-white text-slate-400 border-b border-slate-50">
                                    <tr>
                                        <th className="p-3 md:p-4 text-right font-medium">المادة</th>
                                        <th className="p-3 md:p-4 text-right font-medium">المدرس</th>
                                        <th className="p-3 md:p-4 text-center font-medium">الحصص</th>
                                        <th className="p-3 md:p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classAllocations.map(a => {
                                        const sub = subjects.find(s => s.id === a.subjectId);
                                        const tea = teachers.find(t => t.id === a.teacherId);
                                        return (
                                            <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition">
                                                <td className="p-3 md:p-4">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-[10px] md:text-xs shadow-sm font-bold" style={{background: sub?.color || '#ccc'}}>
                                                            {sub?.name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{sub?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 md:p-4 text-slate-600 font-medium">{tea?.name}</td>
                                                <td className="p-3 md:p-4 text-center">
                                                    <span className="bg-slate-100 px-2 py-1 md:px-3 md:py-1 rounded-lg font-bold text-slate-700">{a.weeklySessions}</span>
                                                </td>
                                                <td className="p-3 md:p-4 text-left">
                                                    <div className="flex justify-end gap-2">
                                                        <button type="button" onClick={() => setEditingAlloc(a)} className="text-slate-400 hover:text-blue-600 bg-white border border-slate-100 p-1.5 md:p-2 rounded-lg hover:bg-blue-50 transition">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button type="button" onClick={() => removeAllocation(a.id)} className="text-slate-400 hover:text-red-600 bg-white border border-slate-100 p-1.5 md:p-2 rounded-lg hover:bg-red-50 transition">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )
                })}
                {allocations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 md:py-16 text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                        <CheckCircle size={48} className="mb-4 text-slate-200" />
                        <p className="font-bold text-base md:text-lg text-slate-400">القائمة فارغة</p>
                        <p className="text-xs md:text-sm mt-2">استخدم النموذج أعلاه لإضافة المواد وتوزيعها.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!editingAlloc} onClose={() => setEditingAlloc(null)} title="تعديل الحصص">
                <div className="space-y-6 md:space-y-8">
                    <div className="text-center">
                         <div className="text-5xl md:text-6xl font-black text-orange-500 mb-2 md:mb-4">{editingAlloc?.weeklySessions}</div>
                         <p className="text-slate-500 font-medium text-sm">حصص في الأسبوع</p>
                    </div>
                    
                    <div className="px-4">
                        <NumberStepper 
                            value={editingAlloc?.weeklySessions || 1}
                            onChange={v => setEditingAlloc(prev => prev ? {...prev, weeklySessions: v} : null)}
                            min={1}
                            max={12}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 md:pt-6 border-t border-slate-100">
                        <button type="button" onClick={() => setEditingAlloc(null)} className="flex-1 px-5 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition text-sm">إلغاء</button>
                        <button type="button" onClick={updateAllocation} className="flex-1 px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold shadow-lg shadow-orange-200 transition text-sm">حفظ التغيير</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
