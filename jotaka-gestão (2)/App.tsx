
import React, { useState, useEffect } from 'react';
import { 
  getUnits, getStoredSession, logout, getReservations, initSystem, 
  createReservation, updateReservationStatus, 
  updateReservation, getStatusLabel, deleteReservation
} from './services/api';
import { UnitId, ReservationStatus, Reservation, Client, User } from './types';
import { ReservationCard } from './components/ReservationCard';
import { ReservationForm } from './components/ReservationForm';
import { ReservationDetails } from './components/ReservationDetails';
import { ClientList } from './components/ClientList';
import { GeneralDashboard } from './components/GeneralDashboard';
import { GlobalDashboard } from './components/GlobalDashboard';
import { CompletedReservations } from './components/CompletedReservations';
import { LoginScreen } from './components/LoginScreen';
import { DashboardCalendar } from './components/DashboardCalendar';
import { Documentation } from './components/Documentation';
import { Mural } from './components/Mural';
import { Plus, LogOut, Search, MapPin, ChevronDown, ChevronUp, Globe, CheckCircle2, BookOpen, ShieldCheck, RefreshCw } from 'lucide-react';

const LOGO_URL = "https://i.ibb.co/v6Sdf7G7/jotaka-eee.png";
const COVER_IMAGE_URL = "https://i.ibb.co/Dfc4Y94h/Frame-528.png";
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 horas em milissegundos

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'reservations' | 'clients' | 'global' | 'completed' | 'manual'>('reservations');
  const [selectedUnitId, setSelectedUnitId] = useState<UnitId>(UnitId.ASA_SUL);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await initSystem();
      const session = await getStoredSession();
      
      if (session) {
        const loginTimestamp = localStorage.getItem('jotaka_login_time');
        const now = Date.now();
        
        if (loginTimestamp && now - parseInt(loginTimestamp) > SESSION_TIMEOUT_MS) {
          await handleLogoutAction(true);
        } else {
          setCurrentUser(session);
        }
      }
      setIsReady(true);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      const loginTimestamp = localStorage.getItem('jotaka_login_time');
      if (loginTimestamp && Date.now() - parseInt(loginTimestamp) > SESSION_TIMEOUT_MS) {
        await handleLogoutAction(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (isReady && currentUser) {
        setIsLoadingData(true);
        getReservations(selectedUnitId, selectedDate).then(data => {
            let list = data;
            if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter);
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              list = list.filter(r => r.clientName.toLowerCase().includes(q) || r.clientPhone.includes(q) || r.tableNumber?.includes(q));
            }
            setReservations(list);
            setIsLoadingData(false);
        }).catch(() => setIsLoadingData(false));
    }
  }, [selectedUnitId, selectedDate, statusFilter, searchQuery, dataVersion, isReady, currentUser]);

  const handleLogin = (user: User) => {
    localStorage.setItem('jotaka_login_time', Date.now().toString());
    setIsLoggedOut(false);
    setCurrentUser(user);
  };

  const handleStatusChange = async (status: ReservationStatus) => {
    if (selectedRes) {
        await updateReservationStatus(selectedRes.id, status);
        setDataVersion(v => v + 1);
        setSelectedRes(null);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm("⚠️ EXCLUSÃO DEFINITIVA\n\nEsta reserva será removida permanentemente do Jotaka Cloud. Deseja continuar?")) {
      try {
        await deleteReservation(id);
        setDataVersion(v => v + 1);
        setSelectedRes(null);
      } catch (err: any) {
        alert("🚨 FALHA NA EXCLUSÃO\n\nMotivo: " + (err.message || "Erro desconhecido. Verifique as permissões de acesso (RLS) no Supabase."));
      }
    }
  };

  const handleLogoutAction = async (silent = false) => {
      if (silent || window.confirm("⚠️ AVISO DE SEGURANÇA\n\nDeseja realmente encerrar sua sessão no Jotaka Cloud? Todos os dados locais serão limpos.")) { 
          setIsLoggedOut(true);
          setCurrentUser(null);
          try {
            await logout(); 
          } catch (e) {
            console.error("Erro durante logout:", e);
          }
      }
  };

  if (!isReady) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black text-2xl animate-pulse uppercase tracking-widest">Iniciando Jotaka Cloud...</div>;
  
  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-8 border-4 border-blue-600/30">
          <ShieldCheck className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Sessão Encerrada</h2>
        <p className="text-slate-400 font-bold text-sm mb-8 max-w-xs">Seus dados foram desconectados com segurança dos servidores Jotaka.</p>
        <button 
          onClick={() => window.location.href = window.location.origin}
          className="w-full max-w-xs py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reiniciar Sistema
        </button>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-slate-900 text-white pt-6 pb-4 px-4 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-slate-700">
                <img src={LOGO_URL} className="w-full h-full object-cover" alt="JOTAKA" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter leading-none">JOTAKA</h1>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {currentView === 'global' ? 'GESTÃO GLOBAL' : 
                   currentView === 'manual' ? 'MANUAL DE USO' : 
                   selectedUnitId.replace('_', ' ')}
                </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentView !== 'global' && currentView !== 'manual' && (
              <div className="relative group">
                 <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select 
                    value={selectedUnitId} 
                    onChange={e => setSelectedUnitId(e.target.value as UnitId)}
                    className="bg-slate-800 border-none text-xs font-black uppercase rounded-xl pl-9 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-blue-400"
                  >
                    {getUnits().map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>
            )}
            <button 
              onClick={() => handleLogoutAction()} 
              className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-red-600 active:scale-90" 
              title="Sair do Sistema"
            >
              <LogOut className="w-5 h-5"/>
            </button>
          </div>
        </div>

        <nav className="max-w-5xl mx-auto flex space-x-1 bg-slate-800/50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'global', label: 'Global', icon: Globe },
            { id: 'reservations', label: 'Agenda', icon: null },
            { id: 'completed', label: 'Finalizados', icon: CheckCircle2 },
            { id: 'overview', label: 'Relatórios', icon: null },
            { id: 'clients', label: 'Clientes', icon: null },
            { id: 'manual', label: 'Instruções', icon: BookOpen },
          ].map(view => (
              <button 
                key={view.id}
                onClick={() => setCurrentView(view.id as any)} 
                className={`flex-1 min-w-[75px] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center justify-center gap-0.5 ${currentView === view.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                {view.icon && <view.icon className="w-3 h-3" />}
                {view.label}
              </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {(currentView === 'reservations' || currentView === 'overview' || currentView === 'global') && (
            <div className="w-full h-40 sm:h-56 rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 mb-6 group transition-all duration-500 hover:shadow-2xl">
                <img 
                    src={COVER_IMAGE_URL} 
                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105" 
                    alt="Jotaka Cozinha e Bar" 
                />
            </div>
        )}

        {currentView === 'global' && <GlobalDashboard onSelectUnit={(id) => { setSelectedUnitId(id); setCurrentView('overview'); }} />}
        {currentView === 'manual' && <Documentation />}
        
        {currentView === 'completed' && (
          <CompletedReservations 
            unitId={selectedUnitId} 
            date={selectedDate} 
            onSelect={setSelectedRes}
            dataVersion={dataVersion}
          />
        )}

        {currentView === 'reservations' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                    className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                >
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Fluxo de Calendário</span>
                    {isCalendarExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
                {isCalendarExpanded && (
                    <DashboardCalendar 
                        selectedDate={selectedDate} 
                        onDateSelect={(d) => { setSelectedDate(d); }} 
                        unitId={selectedUnitId}
                        lastUpdate={dataVersion}
                    />
                )}
            </div>

            <div className="relative">
                <Search className={`absolute left-4 top-4.5 w-4 h-4 ${isLoadingData ? 'animate-pulse text-blue-500' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  placeholder="Buscar cliente, mesa ou telefone..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-blue-600 shadow-sm"
                />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                {(['ALL', ...Object.values(ReservationStatus)] as const).map(s => (
                    <button 
                        key={s} 
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap border transition-all ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                        {s === 'ALL' ? 'Todos' : getStatusLabel(s as ReservationStatus)}
                    </button>
                ))}
            </div>

            <div className="grid gap-3">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-tighter">Agenda em {selectedDate.split('-').reverse().join('/')}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{reservations.length} encontradas</span>
              </div>
              {isLoadingData ? (
                 <div className="py-16 text-center text-slate-300 font-black uppercase text-xs animate-pulse">Sincronizando com Jotaka Cloud...</div>
              ) : reservations.length > 0 ? (
                reservations.map(r => <ReservationCard key={r.id} reservation={r} onClick={setSelectedRes} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-300 space-y-4">
                    <MapPin className="w-12 h-12 opacity-10" />
                    <p className="font-black uppercase text-[10px] tracking-widest">Nenhuma reserva para este dia</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'overview' && <GeneralDashboard unitId={selectedUnitId} onOpenStatusConfig={() => {}} />}
        {currentView === 'clients' && <ClientList />}
      </main>

      <Mural user={currentUser} />

      <button onClick={() => setIsFormOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all z-50">
        <Plus className="w-10 h-10" />
      </button>

      {isFormOpen && (
        <ReservationForm 
          unitId={selectedUnitId} 
          initialData={selectedRes || undefined}
          onClose={() => { setIsFormOpen(false); setSelectedRes(null); }} 
          onSubmit={async (data, client) => {
             if (selectedRes) {
                await updateReservation(selectedRes.id, data);
             } else {
                await createReservation(data, client);
             }
             setDataVersion(v => v + 1);
          }} 
        />
      )}
      
      {selectedRes && (
        <ReservationDetails 
          reservation={selectedRes} 
          onClose={() => setSelectedRes(null)} 
          onEdit={() => setIsFormOpen(true)} 
          onDelete={() => handleDeleteReservation(selectedRes.id)}
          onConfirm={() => handleStatusChange(ReservationStatus.CONFIRMED)}
          onCheckIn={() => handleStatusChange(ReservationStatus.CHECKED_IN)} 
          onCheckOut={async (count, amount) => { await updateReservationStatus(selectedRes.id, ReservationStatus.COMPLETED, count, amount); setDataVersion(v => v + 1); setSelectedRes(null); }} 
          onUndoCheckIn={() => handleStatusChange(ReservationStatus.PENDING)} 
          onCancel={() => { if (window.confirm("Deseja realmente CANCELAR esta reserva?")) { handleStatusChange(ReservationStatus.CANCELED); } }}
          onNoShow={() => { if (window.confirm("Confirmar que os clientes NÃO APARECERAM?")) { handleStatusChange(ReservationStatus.NOSHOW); } }}
          onUpdatePax={async (newPax) => { await updateReservation(selectedRes.id, { peopleCount: newPax }); setDataVersion(v => v + 1); setSelectedRes(null); }}
          onChangeStatus={handleStatusChange}
        />
      )}
    </div>
  );
};

export default App;
