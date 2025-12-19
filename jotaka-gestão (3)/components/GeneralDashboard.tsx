
import React, { useState, useEffect } from 'react';
import { UnitId, UserRole, DashboardFilterPeriod } from '../types';
import { getDashboardStats, exportDataToCSV } from '../services/api';
import { TrendingUp, FileSpreadsheet, Settings, PlusCircle, DollarSign, BarChart3, AlertCircle, XCircle, Edit, ShieldAlert, Calendar, Users } from 'lucide-react';

interface Props {
  unitId: UnitId;
  userRole?: UserRole;
  onOpenStatusConfig: () => void;
}

export const GeneralDashboard: React.FC<Props> = ({ unitId, userRole, onOpenStatusConfig }) => {
  const [filterPeriod, setFilterPeriod] = useState<DashboardFilterPeriod>('month');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getDashboardStats(unitId, filterPeriod).then(data => {
      if (isMounted) {
        setStats(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [unitId, filterPeriod]);

  if (isLoading) return <div className="py-20 text-center font-black uppercase text-slate-300 animate-pulse">Carregando métricas de desempenho...</div>;
  if (!stats) return <div className="py-20 text-center text-slate-300 font-black uppercase">Sem dados disponíveis.</div>;

  const maxAgenda = Math.max(...stats.topAgendaDays.map((s: any) => s.count), 1);
  const maxCreation = Math.max(...stats.topCreationDays.map((s: any) => s.count), 1);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
        
        {/* Header de Relatórios */}
        <div className="flex justify-between items-end px-2">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">RELATÓRIOS DE DESEMPENHO</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance e Auditoria de Fluxo</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => exportDataToCSV('reservations', unitId, filterPeriod)}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm active:scale-95 transition-all"
                    title="Exportar CSV Completo"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                </button>
                <button 
                    onClick={onOpenStatusConfig}
                    className="p-3 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-all"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Seletor de Período */}
        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex w-full space-x-1">
                {(['day', 'week', 'month', 'year'] as DashboardFilterPeriod[]).map((p) => {
                    const labels: Record<string, string> = { day: 'Hoje', week: 'Semana', month: 'Mês', year: 'Ano' };
                    const isActive = filterPeriod === p;
                    return (
                        <button
                            key={p}
                            onClick={() => setFilterPeriod(p)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all
                                ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}
                            `}
                        >
                            {labels[p]}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" /> Receita Lançada
                    </h3>
                    <div className="text-4xl font-black tracking-tighter">
                        R$ {stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-blue-500" /> Ticket Médio
                    </h3>
                    <div className="text-4xl font-black tracking-tighter">
                        R$ {stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>

        {/* Relatório de Agenda */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Top 5 Dias com Mais Reservas (Ocupação)
            </h3>
            <div className="flex items-end justify-between h-40 gap-3 px-2">
                {stats.topAgendaDays.length > 0 ? (
                    stats.topAgendaDays.map((item: any, idx: number) => {
                        const height = (item.count / maxAgenda) * 100;
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center items-end h-full">
                                    <div 
                                        style={{ height: `${Math.max(height, 8)}%` }} 
                                        className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {item.count}
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 mt-3 truncate w-full text-center uppercase tracking-tighter">{item.label}</span>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase text-[10px] border border-dashed border-slate-200 rounded-2xl">Sem dados</div>
                )}
            </div>
        </div>

        {/* Relatório de Captação */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center">
                <PlusCircle className="w-4 h-4 mr-2 text-emerald-600" /> Top 5 Dias de Maior Captação (Reservas Feitas)
            </h3>
            <div className="flex items-end justify-between h-40 gap-3 px-2">
                {stats.topCreationDays.length > 0 ? (
                    stats.topCreationDays.map((item: any, idx: number) => {
                        const height = (item.count / maxCreation) * 100;
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center items-end h-full">
                                    <div 
                                        style={{ height: `${Math.max(height, 8)}%` }} 
                                        className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {item.count}
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 mt-3 truncate w-full text-center uppercase tracking-tighter">{item.label}</span>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase text-[10px] border border-dashed border-slate-200 rounded-2xl">Sem dados</div>
                )}
            </div>
        </div>

        {/* Controle de Exceções */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" /> Auditoria e Exceções
             </h3>
             <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                    <XCircle className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                    <span className="text-[9px] font-black text-rose-400 uppercase block mb-1">Cancelados</span>
                    <span className="text-2xl font-black text-rose-600">{stats.canceledCount}</span>
                 </div>
                 <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                    <AlertCircle className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <span className="text-[9px] font-black text-orange-400 uppercase block mb-1">Não apareceram</span>
                    <span className="text-2xl font-black text-orange-600">{stats.noshows}</span>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                    <Edit className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                    <span className="text-[9px] font-black text-amber-400 uppercase block mb-1">Modificados</span>
                    <span className="text-2xl font-black text-amber-600">{stats.modifiedCount}</span>
                 </div>
             </div>
        </div>

        {/* Fluxo de Clientes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" /> Fluxo de clientes JOTAKA
             </h3>
             <div className="grid grid-cols-2 gap-8 relative z-10">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Agendados</span>
                    <span className="text-3xl font-black text-slate-900">{stats.totalPax}</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase block mb-1">Reais (Finalizado)</span>
                    <span className="text-3xl font-black text-blue-600">{stats.totalRealPax}</span>
                 </div>
             </div>
        </div>
    </div>
  );
};
