
import React, { useState, useEffect } from 'react';
import { UnitId, DashboardFilterPeriod } from '../types';
import { getGlobalConsolidatedStats, exportGlobalDataToCSV } from '../services/api';
import { TrendingUp, Building2, BarChart2, FileSpreadsheet, Trophy, DollarSign, Users } from 'lucide-react';

interface Props {
  onSelectUnit: (unitId: UnitId) => void;
}

export const GlobalDashboard: React.FC<Props> = ({ onSelectUnit }) => {
  const [period, setPeriod] = useState<DashboardFilterPeriod>('month');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getGlobalConsolidatedStats(period).then(data => {
      if (isMounted) {
        setStats(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [period]);

  if (isLoading) return <div className="py-20 text-center font-black uppercase text-slate-300 animate-pulse">Consolidando dados globais...</div>;
  if (!stats) return <div className="py-20 text-center text-slate-300 font-black uppercase">Sem dados disponíveis.</div>;

  const maxPax = Math.max(...stats.unitBreakdown.map((u: any) => u.pax), 1);
  
  // O cálculo de comparação agora usa o total de pax REAL versus o melhor mês do período selecionado
  const bestMonthPax = stats.bestMonth?.pax || 1;
  const comparisonPercent = Math.min(100, bestMonthPax > 0 ? Math.round((stats.totalRealPax / bestMonthPax) * 100) : 0);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
        <div className="flex justify-between items-end px-2">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">COMANDO GLOBAL</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grupo Jotaka Cozinha e Bar</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => exportGlobalDataToCSV(period)}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-lg active:scale-95 transition-all"
                    title="Exportar Relatório Consolidado"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                </button>
                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
                    <BarChart2 className="w-5 h-5" />
                </div>
            </div>
        </div>

        {/* Seletor de Período Global */}
        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex w-full space-x-1">
                {(['day', 'week', 'month', 'year'] as DashboardFilterPeriod[]).map((p) => {
                    const labels: Record<string, string> = { day: 'Hoje', week: 'Semana', month: 'Mês', year: 'Ano' };
                    const isActive = period === p;
                    return (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all
                                ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}
                            `}
                        >
                            {labels[p]}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Big Metrics Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-emerald-100 uppercase mb-3 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Faturamento Grupo ({period})
                    </h3>
                    <div className="text-4xl font-black tracking-tighter">
                        R$ {Number(stats.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Clientes Atendidos ({period})
                    </h3>
                    <div className="text-4xl font-black tracking-tighter">
                        {stats.totalRealPax}
                    </div>
                    <p className="text-[8px] font-bold text-blue-300 uppercase mt-1">Total de pessoas finalizadas ou presentes</p>
                </div>
            </div>
        </div>

        {/* Breakdown por Unidade */}
        <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest px-2 mb-4">Performance Individual das Filiais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.unitBreakdown.map((unit: any) => (
                    <button 
                        key={unit.id}
                        onClick={() => onSelectUnit(unit.id as UnitId)}
                        className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-left hover:border-blue-300 hover:shadow-md transition-all group active:scale-95"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Ticket: R$ {Number(unit.avgTicket || 0).toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-4">{unit.name}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Receita</span>
                                <p className="text-lg font-black text-slate-900">R$ {unit.spent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase">clientes JOTAKA</span>
                                <p className="text-lg font-black text-blue-600">{unit.realPax}</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-blue-600 h-full transition-all duration-700" 
                                style={{ width: `${(unit.realPax / Math.max(stats.totalRealPax, 1)) * 100}%` }}
                            ></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Recordes - Agora Realista */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-orange-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Recorde de Performance</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h4 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">{stats.bestMonth.name}</h4>
                        <p className="text-xs font-bold text-orange-100">{stats.bestMonth.pax} clientes atendidos (Pico)</p>
                        <div className="mt-2 flex items-center gap-2">
                             <div className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden max-w-[100px]">
                                <div className="h-full bg-white" style={{ width: `${comparisonPercent}%` }}></div>
                             </div>
                             <span className="text-[8px] font-bold text-orange-100 uppercase">Eficiência do Período</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black leading-none">{comparisonPercent}%</span>
                        <p className="text-[8px] font-black uppercase text-orange-200">Meta Histórica</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
