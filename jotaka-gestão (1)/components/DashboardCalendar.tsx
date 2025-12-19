
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Target } from 'lucide-react';
import { UnitId, DailyCounts } from '../types';
import { getMonthlyReservationCounts } from '../services/api';

interface Props {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  unitId: UnitId;
  lastUpdate?: number;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const DashboardCalendar: React.FC<Props> = ({ selectedDate, onDateSelect, unitId, lastUpdate }) => {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  });

  const [counts, setCounts] = useState<Record<string, DailyCounts>>({});
  const [showSelectors, setShowSelectors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getMonthlyReservationCounts(unitId, year, month).then(data => {
      if (isMounted) {
        setCounts(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [unitId, year, month, lastUpdate]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onDateSelect(`${year}-${monthStr}-${dayStr}`);
  };

  const isSelected = (day: number) => {
    const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
    return day === selDay && (month + 1) === selMonth && year === selYear;
  };

  const getDayData = (day: number): DailyCounts => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const key = `${year}-${monthStr}-${dayStr}`;
    return counts[key] || { scheduled: 0, created: 0, noshows: 0 };
  };

  return (
    <div className="bg-white p-2">
      <div className="flex items-center justify-between px-2 py-4">
        <button onClick={handlePrevMonth} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
        <div className="flex flex-col items-center">
            <button 
                onClick={() => setShowSelectors(!showSelectors)}
                className="flex items-center gap-1 group"
            >
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter transition-colors group-hover:text-blue-600">
                  {MONTH_NAMES[month]} <span className="text-slate-300 ml-1 font-black">{year}</span>
                </h2>
                <Filter className={`w-3 h-3 text-slate-400 transition-transform ${showSelectors ? 'rotate-180' : ''}`} />
            </button>
        </div>
        <button onClick={handleNextMonth} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
      </div>

      {showSelectors && (
          <div className="p-4 bg-slate-50 border-y border-slate-100 mb-4 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Mês</label>
                  <select 
                    value={month} 
                    onChange={e => { setViewDate(new Date(year, parseInt(e.target.value), 1)); setShowSelectors(false); }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-blue-600 text-xs"
                  >
                      {MONTH_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Ano</label>
                  <select 
                    value={year} 
                    onChange={e => { setViewDate(new Date(parseInt(e.target.value), month, 1)); setShowSelectors(false); }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-blue-600 text-xs"
                  >
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
              </div>
          </div>
      )}

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-black text-slate-400 uppercase py-2">{d}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isLoading ? 'opacity-50' : ''}`}>
        {calendarDays.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;
          const { scheduled } = getDayData(day);
          const selected = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                relative aspect-square flex flex-col items-center justify-between p-1.5 rounded-2xl transition-all duration-300 group
                ${selected ? 'bg-blue-600 text-white shadow-xl scale-105 z-10' : 'bg-slate-50 text-slate-700 hover:bg-blue-50'}
              `}
            >
              <span className={`text-sm font-black ${selected ? 'text-white' : 'text-slate-800'}`}>{day}</span>
              
              <div className="w-full flex flex-col gap-0.5">
                {scheduled > 0 && (
                    <div className={`flex items-center justify-center gap-0.5 rounded-md text-[8px] font-black py-0.5 ${selected ? 'bg-white/20' : 'bg-blue-600 text-white'}`}>
                        <Target className="w-2 h-2" /> {scheduled}
                    </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Agenda do Dia</span>
          </div>
      </div>
    </div>
  );
};
