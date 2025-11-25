
import React, { useState, useEffect } from 'react';
import { ClassForm, TeacherForm, SubjectForm, AllocationManager, SettingsForm } from './components/Forms';
import { ScheduleView } from './components/Views';
import { ClassGroup, Teacher, Subject, Allocation, ScheduleResult } from './types';
import { generateSmartSchedule } from './services/scheduler';
import { Calendar, LayoutGrid, BrainCircuit, RefreshCw, Database, Users, BookOpen, Layers, BarChart3, Trash2, Home, Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';

const App = () => {
  // --- Splash Screen State ---
  const [showSplash, setShowSplash] = useState(true);

  // --- State Initialization with Robust Migration Logic ---
  const [activeTab, setActiveTab] = useState<'data' | 'schedule'>('data');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const loadState = <T,>(key: string, defaultValue: T, migrator?: (data: any) => T): T => {
      try {
          const item = localStorage.getItem(key);
          if (!item) return defaultValue;
          const parsed = JSON.parse(item);
          return migrator ? migrator(parsed) : parsed;
      } catch (e) {
          console.error(`Failed to load ${key}`, e);
          return defaultValue;
      }
  };

  const [classes, setClasses] = useState<ClassGroup[]>(() => 
    loadState('classes', [])
  );

  const [subjects, setSubjects] = useState<Subject[]>(() => 
    loadState('subjects', [], (data) => data.map((s: any) => ({
        ...s,
        color: s.color || '#3B82F6'
    })))
  );

  const [teachers, setTeachers] = useState<Teacher[]>(() => 
    loadState('teachers', [], (data) => data.map((t: any) => ({
        ...t,
        unavailableSlots: Array.isArray(t.unavailableSlots) ? t.unavailableSlots : [],
        maxSessionsPerWeek: typeof t.maxSessionsPerWeek === 'number' ? t.maxSessionsPerWeek : 24,
        specialty: t.specialty || ''
    })))
  );

  const [allocations, setAllocations] = useState<Allocation[]>(() => 
    loadState('allocations', [])
  );

  const [periodsPerDay, setPeriodsPerDay] = useState<number>(() => 
    loadState('periodsPerDay', 7)
  );
  
  const [schedule, setSchedule] = useState<ScheduleResult>({ items: [], conflicts: [], success: false });

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => localStorage.setItem('classes', JSON.stringify(classes)), [classes]);
  useEffect(() => localStorage.setItem('subjects', JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem('teachers', JSON.stringify(teachers)), [teachers]);
  useEffect(() => localStorage.setItem('allocations', JSON.stringify(allocations)), [allocations]);
  useEffect(() => localStorage.setItem('periodsPerDay', JSON.stringify(periodsPerDay)), [periodsPerDay]);

  // --- Handlers ---
  const handleGenerate = () => {
    if(allocations.length === 0) {
        alert("يرجى توزيع المواد على الصفوف أولاً.");
        return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        const result = generateSmartSchedule(classes, teachers, allocations, periodsPerDay);
        setSchedule(result);
        setIsGenerating(false);
        setActiveTab('schedule');
      } catch (error) {
        console.error("Generation error:", error);
        alert("حدث خطأ غير متوقع أثناء توليد الجدول.");
        setIsGenerating(false);
      }
    }, 500); // Slight delay for visual feedback
  };

  const clearData = () => {
    if(window.confirm('تحذير: سيتم حذف جميع البيانات نهائياً! هل أنت متأكد؟')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const handleBackup = () => {
      const data = {
          version: 2,
          timestamp: Date.now(),
          periodsPerDay,
          classes,
          subjects,
          teachers,
          allocations
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const data = JSON.parse(content);
              if(data.classes) setClasses(data.classes);
              if(data.subjects) setSubjects(data.subjects);
              if(data.teachers) setTeachers(data.teachers.map((t: any) => ({...t, unavailableSlots: t.unavailableSlots || []})));
              if(data.allocations) setAllocations(data.allocations);
              if(data.periodsPerDay) setPeriodsPerDay(data.periodsPerDay);
              alert("تم استعادة البيانات بنجاح");
          } catch(err) {
              alert("الملف غير صالح");
          }
      };
      reader.readAsText(file);
      event.target.value = '';
  };

  // --- Splash Screen Component ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 text-white animate-fade-in">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse-soft"></div>
            <Calendar size={80} className="text-amber-400 mb-6 relative z-10 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight">المجدول الذكي</h1>
        <p className="text-indigo-200 text-lg mb-8 font-light">الإصدار الاحترافي 3.0</p>
        
        <div className="mt-12 text-center opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
            <p className="text-sm text-gray-400 mb-1">تمت البرمجة والتطوير بواسطة</p>
            <h2 className="text-2xl font-bold text-amber-400">الأستاذ هادي الدليمي</h2>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
      classes: classes.length,
      teachers: teachers.length,
      subjects: subjects.length,
      assignments: allocations.length,
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col lg:flex-row font-sans text-right text-slate-800" dir="rtl">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex w-72 bg-indigo-950 text-white flex-col h-full sticky top-0 shadow-2xl z-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-20"></div>

        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                <Calendar size={28} className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">المجدول الذكي</h1>
                <p className="text-[10px] text-indigo-300 uppercase tracking-widest">نسخة الاستاذ هادي</p>
            </div>
          </div>

          <nav className="space-y-3">
             <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'data' ? 'bg-white/10 text-white font-bold shadow-inner border border-white/5' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}>
                <Database size={20} className={activeTab === 'data' ? 'text-amber-400' : 'group-hover:text-amber-400 transition-colors'} />
                <span>إدارة البيانات</span>
             </button>
             <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'schedule' ? 'bg-white/10 text-white font-bold shadow-inner border border-white/5' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}>
                <LayoutGrid size={20} className={activeTab === 'schedule' ? 'text-amber-400' : 'group-hover:text-amber-400 transition-colors'} />
                <span>عرض الجدول</span>
             </button>
          </nav>
        </div>

        <div className="mt-auto p-6 relative z-10">
            <div className="bg-indigo-900/50 p-4 rounded-2xl border border-indigo-800/50 backdrop-blur-sm">
                <h3 className="text-xs font-bold text-indigo-300 mb-3 uppercase">إحصائيات سريعة</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-indigo-950 rounded-lg">
                        <span className="block text-lg font-bold text-white">{stats.teachers}</span>
                        <span className="text-[10px] text-indigo-400">مدرس</span>
                    </div>
                    <div className="text-center p-2 bg-indigo-950 rounded-lg">
                        <span className="block text-lg font-bold text-white">{stats.classes}</span>
                        <span className="text-[10px] text-indigo-400">شعبة</span>
                    </div>
                </div>
            </div>
            <button onClick={clearData} className="w-full mt-4 text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-lg transition">
                <Trash2 size={14} /> تهيئة النظام
            </button>
        </div>
      </aside>


      {/* --- MOBILE HEADER & CONTENT --- */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex-shrink-0 bg-indigo-950 text-white p-3 flex justify-between items-center shadow-lg z-30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-blue-900 opacity-50"></div>
            <div className="relative z-10 flex items-center gap-2">
                <div className="bg-amber-500 p-1 rounded-lg">
                    <Calendar size={18} className="text-white" />
                </div>
                <h1 className="font-bold text-base">المجدول الذكي</h1>
            </div>
            <div className="relative z-10 bg-indigo-800/50 px-2 py-0.5 rounded-full text-[10px] border border-indigo-700">
                v3.0
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 pb-20 lg:pb-0 scroll-smooth">
            
            {activeTab === 'data' && (
                <div className="max-w-6xl mx-auto p-3 md:p-8 space-y-4 lg:space-y-8 animate-fade-in">
                    
                    {/* Dashboard Welcome Card */}
                    <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xl shadow-indigo-100 border border-white relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"></div>
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1">لوحة التحكم</h2>
                                <p className="text-sm md:text-base text-slate-500">مرحباً بك، ابدأ بإعداد بيانات المدرسة.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="flex-1 md:flex-none bg-indigo-50 text-indigo-700 px-3 py-2 rounded-2xl font-bold flex flex-col items-center justify-center min-w-[70px]">
                                    <span className="text-lg md:text-xl">{stats.subjects}</span>
                                    <span className="text-[9px] md:text-[10px] uppercase">مواد</span>
                                </div>
                                <div className="flex-1 md:flex-none bg-amber-50 text-amber-700 px-3 py-2 rounded-2xl font-bold flex flex-col items-center justify-center min-w-[70px]">
                                    <span className="text-lg md:text-xl">{stats.assignments}</span>
                                    <span className="text-[9px] md:text-[10px] uppercase">توزيع</span>
                                </div>
                            </div>
                         </div>
                    </div>

                    <SettingsForm 
                        periodsPerDay={periodsPerDay} 
                        setPeriodsPerDay={setPeriodsPerDay} 
                        onBackup={handleBackup}
                        onRestore={handleRestore}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <ClassForm classes={classes} setClasses={setClasses} />
                        <SubjectForm subjects={subjects} setSubjects={setSubjects} />
                    </div>
                    
                    <TeacherForm teachers={teachers} setTeachers={setTeachers} periodsPerDay={periodsPerDay} />
                    
                    <div className="pt-4 md:pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <BarChart3 size={18} />
                            </div>
                            <h2 className="text-lg md:text-2xl font-bold text-slate-800">توزيع الخطة الدراسية</h2>
                        </div>
                        <AllocationManager 
                            classes={classes} 
                            subjects={subjects} 
                            teachers={teachers} 
                            allocations={allocations}
                            setAllocations={setAllocations}
                            periodsPerDay={periodsPerDay}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="max-w-7xl mx-auto p-3 md:p-8 space-y-4 md:space-y-6">
                    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl shadow-indigo-100 border border-white flex flex-col md:flex-row justify-between items-center gap-4 no-print">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-200">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-800">الجدول النهائي</h2>
                                <p className="text-slate-400 text-xs">تم التوليد: {schedule.timestamp ? new Date(schedule.timestamp).toLocaleTimeString('ar-EG') : '-'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={handleGenerate} className="flex-1 md:flex-none bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-bold flex items-center justify-center gap-2 text-sm md:text-base">
                                <RefreshCw size={16} /> إعادة التوليد
                            </button>
                        </div>
                    </div>
                    <ScheduleView 
                        schedule={schedule} 
                        classes={classes} 
                        teachers={teachers} 
                        subjects={subjects} 
                        periodsPerDay={periodsPerDay}
                    />
                </div>
            )}
        </div>

        {/* --- FLOATING ACTION BUTTON (FAB) FOR GENERATION --- */}
        {activeTab === 'data' && (
            <div className="fixed bottom-20 lg:bottom-10 left-4 lg:left-10 z-30 animate-fade-in">
                 <button
                    disabled={isGenerating || allocations.length === 0}
                    onClick={handleGenerate}
                    className={`flex items-center gap-2 md:gap-3 px-5 py-3 md:px-6 md:py-4 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                        isGenerating || allocations.length === 0
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-orange-500/40'
                    }`}
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
                    <span className="font-bold text-sm md:text-lg">توليد الجدول</span>
                </button>
            </div>
        )}

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] flex justify-around items-center py-2 pb-safe z-40 glass">
            <button 
                onClick={() => setActiveTab('data')} 
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl w-14 transition-all ${activeTab === 'data' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-400'}`}
            >
                <Home size={20} className={activeTab === 'data' ? 'fill-current' : ''} />
                <span className="text-[9px]">الرئيسية</span>
            </button>
            
            <div className="w-px h-6 bg-slate-100"></div>

            <button 
                onClick={() => setActiveTab('schedule')} 
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl w-14 transition-all ${activeTab === 'schedule' ? 'text-amber-600 bg-amber-50 font-bold' : 'text-slate-400'}`}
            >
                <LayoutGrid size={20} className={activeTab === 'schedule' ? 'fill-current' : ''} />
                <span className="text-[9px]">الجدول</span>
            </button>
            
             <div className="w-px h-6 bg-slate-100"></div>

            <button 
                onClick={clearData} 
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl w-14 text-slate-400 hover:text-red-500 transition-colors"
            >
                <Trash2 size={20} />
                <span className="text-[9px]">مسح</span>
            </button>
        </nav>

      </main>
    </div>
  );
};

export default App;
