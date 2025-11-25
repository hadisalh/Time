import React, { useRef, useState } from 'react';
import { ScheduleResult, ClassGroup, Teacher, Subject } from '../types';
import { DAYS } from '../constants';
import { Printer, AlertTriangle, CalendarCheck, Users, X, Image as ImageIcon, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ScheduleViewProps {
  schedule: ScheduleResult;
  classes: ClassGroup[];
  teachers: Teacher[];
  subjects: Subject[];
  periodsPerDay: number;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, classes, teachers, subjects, periodsPerDay }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    // Set title for PDF file name
    const originalTitle = document.title;
    document.title = `الجدول_المدرسي_${new Date().toISOString().split('T')[0]}`;
    window.print();
    document.title = originalTitle;
  };

  // --- GENERIC IMAGE CAPTURE FUNCTION ---
  const captureElement = async (element: HTMLElement, fileName: string) => {
    if (isExporting) return;
    setIsExporting(true);

    try {
        // 1. Create a deep clone
        const clone = element.cloneNode(true) as HTMLElement;

        // 2. Setup the clone container to be invisible but renderable
        Object.assign(clone.style, {
            position: 'fixed',
            top: '-10000px',
            left: '0',
            zIndex: '-1000',
            width: '1000px', // Fixed nice width for single card
            minWidth: '1000px',
            maxWidth: '1000px',
            height: 'auto',
            overflow: 'visible',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            transform: 'none',
            direction: 'rtl',
            fontFamily: "'Cairo', sans-serif",
            margin: '0'
        });

        // 3. Clean up the clone
        // Remove download buttons from the image
        const buttons = clone.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());

        // Fix internal elements
        const allElements = clone.querySelectorAll('*');
        allElements.forEach((el: any) => {
            // Remove Scrollbars
            const style = window.getComputedStyle(el);
            if (style.overflow !== 'visible' || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
                el.style.overflow = 'visible';
                el.style.overflowX = 'visible';
                el.style.overflowY = 'visible';
            }
            if (el.classList.contains('overflow-x-auto')) {
                el.style.width = '100%';
                el.style.display = 'block';
            }
            
            // Fix Text Rendering
            el.style.fontVariant = 'normal';
            el.style.letterSpacing = 'normal';
            
            // Fix Table Alignment
            if (el.tagName === 'TH' || el.tagName === 'TD') {
                el.style.textAlign = 'center';
                el.style.verticalAlign = 'middle';
            }
        });

        document.body.appendChild(clone);

        // 4. Wait for font/layout
        await new Promise(resolve => setTimeout(resolve, 500)); 

        // 5. Capture
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            x: -10,
            y: -10,
            width: clone.scrollWidth + 20,
            height: clone.scrollHeight + 20,
            ignoreElements: (element: any) => element.classList.contains('no-print')
        });

        document.body.removeChild(clone);

        // 6. Download
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `${fileName}.png`;
        link.click();

    } catch (error) {
        console.error("Image export failed", error);
        alert("حدث خطأ أثناء حفظ الصورة.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleDownloadFullImage = async () => {
    if (!printRef.current) return;
    
    // Custom logic for full page (similar to captureElement but wider)
    if (isExporting) return;
    setIsExporting(true);
    
    try {
         const element = printRef.current;
         const clone = element.cloneNode(true) as HTMLElement;
         Object.assign(clone.style, {
            position: 'absolute', top: '-10000px', left: '0', zIndex: '-1000',
            width: 'max-content', minWidth: '1200px', height: 'auto',
            overflow: 'visible', backgroundColor: '#ffffff', padding: '40px',
            transform: 'none', direction: 'rtl', fontFamily: "'Cairo', sans-serif"
        });
        
        // Remove buttons
        clone.querySelectorAll('button').forEach(b => b.remove());

        // Fix internals
        clone.querySelectorAll('*').forEach((el: any) => {
            el.style.overflow = 'visible';
            if (el.classList.contains('overflow-x-auto')) el.style.width = '100%';
            el.style.fontVariant = 'normal';
        });

        document.body.appendChild(clone);
        await new Promise(resolve => setTimeout(resolve, 800));

        const canvas = await html2canvas(clone, {
            scale: 2, useCORS: true, backgroundColor: '#ffffff',
            width: clone.offsetWidth + 80, height: clone.offsetHeight + 80,
            x: -10, y: -10
        });

        document.body.removeChild(clone);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `الجدول_كامل_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    } catch(e) {
        console.error(e);
        alert("فشل التصدير");
    } finally {
        setIsExporting(false);
    }
  };

  const handleSingleDownload = (id: string, name: string) => {
      const element = document.getElementById(id);
      if (element) {
          captureElement(element, `جدول_${name.replace(/\s/g, '_')}`);
      }
  };

  if (schedule.items.length === 0 && !schedule.success) {
    return (
      <div className="text-center p-8 md:p-12 bg-white rounded-3xl shadow-xl text-slate-500 border border-red-100">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">عذراً، لم يكتمل التوليد</h3>
        <p className="text-slate-500 mb-6 text-sm md:text-base">واجه النظام بعض التعارضات التي لا يمكن حلها</p>
        <div className="text-right max-w-2xl mx-auto bg-red-50 p-4 md:p-6 rounded-2xl border border-red-100">
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-red-700 font-medium">
                {schedule.conflicts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
        </div>
      </div>
    );
  }

  const periods = Array.from({ length: periodsPerDay }, (_, i) => `${i + 1}`);

  const getClassCell = (classId: string, day: number, period: number) => {
      const item = schedule.items.find(i => i.classId === classId && i.dayIndex === day && i.periodIndex === period);
      if(!item) return null;
      const sub = subjects.find(s => s.id === item.subjectId);
      const tea = teachers.find(t => t.id === item.teacherId);
      return { subject: sub, teacher: tea };
  };

  const getTeacherCell = (teacherId: string, day: number, period: number) => {
      const item = schedule.items.find(i => i.teacherId === teacherId && i.dayIndex === day && i.periodIndex === period);
      if(item) {
          const sub = subjects.find(s => s.id === item.subjectId);
          const cls = classes.find(c => c.id === item.classId);
          return { type: 'session', subject: sub, class: cls };
      }
      
      const teacher = teachers.find(t => t.id === teacherId);
      const isUnavail = teacher?.unavailableSlots.some(s => s.dayIndex === day && s.periodIndex === period);
      if(isUnavail) return { type: 'off' };

      return null;
  };


  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
      
      {/* EXPORT TOOLBAR */}
      <div className="flex flex-wrap gap-3 no-print">
         <button 
            onClick={handlePrint}
            className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm"
         >
            <Printer size={18} />
            <span>طباعة / PDF</span>
         </button>
         <button 
            onClick={handleDownloadFullImage}
            disabled={isExporting}
            className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
         >
            {isExporting ? <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div> : <ImageIcon size={18} />}
            <span>{isExporting ? 'جاري المعالجة...' : 'حفظ الجدول كاملاً كصورة'}</span>
         </button>
      </div>

      {!schedule.success && schedule.conflicts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 no-print flex items-start gap-3">
             <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-amber-500 shrink-0 mt-0.5" />
             <div>
                <h3 className="font-bold text-amber-800 text-sm md:text-base">ملاحظات على الجدول</h3>
                <ul className="mt-2 text-xs md:text-sm text-amber-700 list-disc list-inside">
                    {schedule.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
             </div>
          </div>
      )}

      <div ref={printRef} className="space-y-12 bg-white p-2 md:p-8 rounded-3xl">
        
        {/* SECTION 1: CLASSES */}
        <div className="print-section">
             <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-indigo-100 pb-4">
                 <div className="bg-indigo-600 text-white p-2 rounded-lg"><CalendarCheck size={20}/></div>
                 <h3 className="text-lg md:text-2xl font-bold text-indigo-900">جداول الصفوف الدراسية</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:gap-12">
                {classes.map(cls => (
                    <div id={`class-card-${cls.id}`} key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid page-break">
                        <div className="bg-indigo-900 text-white p-3 md:p-4 text-center border-b-4 border-amber-500 flex justify-between items-center px-4">
                            <div className="w-8"></div> {/* Spacer */}
                            <h2 className="text-xl md:text-2xl font-black tracking-wide">{cls.name}</h2>
                            <button 
                                onClick={() => handleSingleDownload(`class-card-${cls.id}`, cls.name)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-white no-print"
                                title="تنزيل كصورة"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-[10px] md:text-sm uppercase tracking-wider">
                                    <th className="p-2 md:p-3 border border-slate-200 w-16 md:w-24 font-bold bg-slate-100">اليوم</th>
                                    {periods.map((p, i) => <th key={i} className="p-2 md:p-3 border border-slate-200 font-bold whitespace-nowrap min-w-[60px]">الحصة {p}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map((d, dIdx) => (
                                    <tr key={dIdx}>
                                        <td className="p-2 md:p-3 border border-slate-200 font-bold bg-slate-50 text-slate-800 text-xs md:text-base">{d}</td>
                                        {Array.from({length: periodsPerDay}).map((_, pIdx) => {
                                            const data = getClassCell(cls.id, dIdx, pIdx);
                                            return (
                                                <td key={pIdx} className="p-0.5 md:p-1 border border-slate-200 h-14 md:h-20 min-w-[5rem] md:min-w-[8rem] align-middle">
                                                    {data ? (
                                                        <div className="flex flex-col items-center justify-center h-full w-full rounded p-0.5 md:p-1" style={{backgroundColor: `${data.subject?.color}15`, borderLeft: `3px solid ${data.subject?.color}`}}>
                                                            <span className="font-bold text-[10px] md:text-sm" style={{color: data.subject?.color}}>{data.subject?.name}</span>
                                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-0.5 md:mt-1 bg-white px-1.5 rounded-full border border-slate-100 whitespace-nowrap">{data.teacher?.name}</span>
                                                        </div>
                                                    ) : <span className="text-slate-200 text-lg md:text-2xl font-light">-</span>}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SECTION 2: TEACHERS */}
        <div className="print-section">
             <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-emerald-100 pb-4 mt-10 md:mt-16">
                 <div className="bg-emerald-600 text-white p-2 rounded-lg"><Users size={20}/></div>
                 <h3 className="text-lg md:text-2xl font-bold text-emerald-900">جداول المدرسين</h3>
            </div>
            <div className="grid grid-cols-1 gap-8 md:gap-12">
                {teachers.map(tea => (
                    <div id={`teacher-card-${tea.id}`} key={tea.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid page-break">
                        <div className="bg-emerald-800 text-white p-3 md:p-4 flex justify-between px-4 md:px-6 items-center border-b-4 border-emerald-500">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg md:text-xl font-bold">{tea.name}</h2>
                                <span className="bg-emerald-900/50 px-2 py-0.5 md:px-3 md:py-1 rounded text-xs md:text-sm font-medium border border-emerald-700">{tea.specialty}</span>
                            </div>
                            <button 
                                onClick={() => handleSingleDownload(`teacher-card-${tea.id}`, tea.name)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-white no-print"
                                title="تنزيل جدول المدرس"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                         <div className="overflow-x-auto">
                         <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-[10px] md:text-sm uppercase tracking-wider">
                                    <th className="p-2 md:p-3 border border-slate-200 w-16 md:w-24 font-bold bg-slate-100">اليوم</th>
                                    {periods.map((p, i) => <th key={i} className="p-2 md:p-3 border border-slate-200 font-bold whitespace-nowrap min-w-[60px]">الحصة {p}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map((d, dIdx) => (
                                    <tr key={dIdx}>
                                        <td className="p-2 md:p-3 border border-slate-200 font-bold bg-slate-50 text-slate-800 text-xs md:text-base">{d}</td>
                                        {Array.from({length: periodsPerDay}).map((_, pIdx) => {
                                            const data = getTeacherCell(tea.id, dIdx, pIdx);
                                            
                                            if (data?.type === 'off') {
                                                return <td key={pIdx} className="border border-slate-200 bg-slate-100 h-14 md:h-20"><div className="w-full h-full flex items-center justify-center opacity-20"><X size={16}/></div></td>
                                            }

                                            return (
                                                <td key={pIdx} className="p-0.5 md:p-1 border border-slate-200 h-14 md:h-20 min-w-[5rem] md:min-w-[8rem] align-middle">
                                                    {data && data.type === 'session' ? (
                                                        <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-50 rounded p-0.5 md:p-1 border border-emerald-100">
                                                            <span className="font-black text-[10px] md:text-sm text-emerald-900">{data.class?.name}</span>
                                                            <span className="text-[9px] md:text-[10px] text-emerald-600 mt-0.5 md:mt-1 font-medium whitespace-nowrap">{data.subject?.name}</span>
                                                        </div>
                                                    ) : <span className="text-slate-200 text-lg md:text-2xl font-light">-</span>}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-24 lg:bottom-10 right-4 lg:right-10 z-30 no-print flex flex-col gap-3">
        <button
          onClick={handleDownloadFullImage}
          disabled={isExporting}
          className="bg-emerald-600 text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-emerald-700 transition transform hover:scale-110 disabled:bg-slate-400"
        >
          {isExporting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ImageIcon size={20} />}
        </button>
        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-black transition transform hover:scale-110"
        >
          <Printer size={20} />
        </button>
      </div>

    </div>
  );
};