import React, { useRef } from 'react';
import { ScheduleResult, ClassGroup, Teacher, Subject } from '../types';
import { DAYS } from '../constants';
import { Printer, AlertTriangle, CalendarCheck, Users, X } from 'lucide-react';

interface ScheduleViewProps {
  schedule: ScheduleResult;
  classes: ClassGroup[];
  teachers: Teacher[];
  subjects: Subject[];
  periodsPerDay: number;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, classes, teachers, subjects, periodsPerDay }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (schedule.items.length === 0 && !schedule.success) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl shadow-xl text-slate-500 border border-red-100">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">عذراً، لم يكتمل التوليد</h3>
        <p className="text-slate-500 mb-6">واجه النظام بعض التعارضات التي لا يمكن حلها</p>
        <div className="text-right max-w-2xl mx-auto bg-red-50 p-6 rounded-2xl border border-red-100">
            <ul className="list-disc list-inside space-y-2 text-sm text-red-700 font-medium">
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
    <div className="space-y-8 animate-fade-in pb-20">
      
      {!schedule.success && schedule.conflicts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 no-print flex items-start gap-3">
             <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
             <div>
                <h3 className="font-bold text-amber-800">ملاحظات على الجدول</h3>
                <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                    {schedule.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
             </div>
          </div>
      )}

      <div ref={printRef} className="space-y-12">
        
        {/* SECTION 1: CLASSES */}
        <div className="print-section">
             <div className="flex items-center gap-3 mb-8 border-b border-indigo-100 pb-4">
                 <div className="bg-indigo-600 text-white p-2 rounded-lg"><CalendarCheck size={24}/></div>
                 <h3 className="text-2xl font-bold text-indigo-900">جداول الصفوف الدراسية</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-12">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid page-break">
                        <div className="bg-indigo-900 text-white p-4 text-center border-b-4 border-amber-500">
                            <h2 className="text-2xl font-black tracking-wide">{cls.name}</h2>
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                                    <th className="p-3 border border-slate-200 w-24 font-bold bg-slate-100">اليوم</th>
                                    {periods.map((p, i) => <th key={i} className="p-3 border border-slate-200 font-bold">الحصة {p}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map((d, dIdx) => (
                                    <tr key={dIdx}>
                                        <td className="p-3 border border-slate-200 font-bold bg-slate-50 text-slate-800">{d}</td>
                                        {Array.from({length: periodsPerDay}).map((_, pIdx) => {
                                            const data = getClassCell(cls.id, dIdx, pIdx);
                                            return (
                                                <td key={pIdx} className="p-1 border border-slate-200 h-20 w-32 align-middle">
                                                    {data ? (
                                                        <div className="flex flex-col items-center justify-center h-full w-full rounded p-1" style={{backgroundColor: `${data.subject?.color}15`, borderLeft: `4px solid ${data.subject?.color}`}}>
                                                            <span className="font-bold text-sm" style={{color: data.subject?.color}}>{data.subject?.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 mt-1 bg-white px-2 rounded-full border border-slate-100">{data.teacher?.name}</span>
                                                        </div>
                                                    ) : <span className="text-slate-200 text-2xl font-light">-</span>}
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
             <div className="flex items-center gap-3 mb-8 border-b border-emerald-100 pb-4 mt-16">
                 <div className="bg-emerald-600 text-white p-2 rounded-lg"><Users size={24}/></div>
                 <h3 className="text-2xl font-bold text-emerald-900">جداول المدرسين</h3>
            </div>
            <div className="grid grid-cols-1 gap-12">
                {teachers.map(tea => (
                    <div key={tea.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid page-break">
                        <div className="bg-emerald-800 text-white p-4 flex justify-between px-6 items-center border-b-4 border-emerald-500">
                            <h2 className="text-xl font-bold">{tea.name}</h2>
                            <span className="bg-emerald-900/50 px-3 py-1 rounded text-sm font-medium border border-emerald-700">{tea.specialty}</span>
                        </div>
                         <div className="overflow-x-auto">
                         <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                                    <th className="p-3 border border-slate-200 w-24 font-bold bg-slate-100">اليوم</th>
                                    {periods.map((p, i) => <th key={i} className="p-3 border border-slate-200 font-bold">الحصة {p}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map((d, dIdx) => (
                                    <tr key={dIdx}>
                                        <td className="p-3 border border-slate-200 font-bold bg-slate-50 text-slate-800">{d}</td>
                                        {Array.from({length: periodsPerDay}).map((_, pIdx) => {
                                            const data = getTeacherCell(tea.id, dIdx, pIdx);
                                            
                                            if (data?.type === 'off') {
                                                return <td key={pIdx} className="border border-slate-200 bg-slate-100 h-20"><div className="w-full h-full flex items-center justify-center opacity-20"><X size={20}/></div></td>
                                            }

                                            return (
                                                <td key={pIdx} className="p-1 border border-slate-200 h-20 w-32 align-middle">
                                                    {data && data.type === 'session' ? (
                                                        <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-50 rounded p-1 border border-emerald-100">
                                                            <span className="font-black text-sm text-emerald-900">{data.class?.name}</span>
                                                            <span className="text-[10px] text-emerald-600 mt-1 font-medium">{data.subject?.name}</span>
                                                        </div>
                                                    ) : <span className="text-slate-200 text-2xl font-light">-</span>}
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
      
      {/* Floating Print Button for Mobile */}
      <div className="fixed bottom-24 lg:bottom-10 right-4 lg:right-10 z-30 no-print">
        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-black transition transform hover:scale-110"
        >
          <Printer size={24} />
        </button>
      </div>

    </div>
  );
};