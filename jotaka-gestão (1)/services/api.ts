
import { supabase } from './supabase';
import { Client, Reservation, ReservationStatus, Unit, UnitId, User, UserRole, DashboardFilterPeriod, HistoryEntry, DailyCounts, Notice } from '../types';

const UNITS: Unit[] = [
  { id: UnitId.ASA_SUL, name: 'Asa Sul' },
  { id: UnitId.AGUAS_CLARAS, name: 'Águas Claras' },
  { id: UnitId.TAGUATINGA, name: 'Taguatinga' },
  { id: UnitId.CEILANDIA, name: 'Ceilândia' },
];

const DEFAULT_LABELS: Record<string, string> = {
    PENDING: 'Agendado',
    CONFIRMED: 'Pré-Confirmado',
    CHECKED_IN: 'Presente',
    COMPLETED: 'Finalizado',
    CANCELED: 'Cancelado',
    NOSHOW: 'Não compareceram'
};

const mapReservation = (r: any): Reservation => ({
    ...r,
    unitId: r.unit_id,
    clientId: r.client_id,
    clientName: r.client_name,
    clientPhone: r.client_phone,
    peopleCount: r.people_count,
    confirmedPeopleCount: r.confirmed_people_count,
    spentAmount: r.spent_amount,
    eventType: r.event_type,
    tableNumber: r.table_number,
    special_notes: r.special_notes,
    notesAuthor: r.notes_author,
    createdAt: r.created_at,
    lastModifiedBy: r.last_modified_by,
    lastModifiedAt: r.last_modified_at,
    time: r.time ? r.time.substring(0, 5) : ''
});

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const login = async (email: string, password: string): Promise<{ success: true; user: User } | { success: false; message: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { success: false, message: 'Acesso negado: Verifique e-mail e senha.' };

    const user: User = {
        id: data.user.id,
        name: data.user.user_metadata.full_name || 'Usuário',
        username: email,
        role: data.user.user_metadata.role || UserRole.MANAGER
    };

    return { success: true, user };
};

export const logout = async () => {
    try {
        await supabase.auth.signOut();
    } catch (err) {
        console.error("Erro ao sair do Supabase:", err);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    }
};

export const getStoredSession = async (): Promise<User | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    
    return {
        id: session.user.id,
        name: session.user.user_metadata.full_name || 'Usuário',
        username: session.user.email || '',
        role: session.user.user_metadata.role || UserRole.MANAGER
    };
};

export const getNotices = async (): Promise<Notice[]> => {
    const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const createNotice = async (notice: Partial<Notice>): Promise<void> => {
    const { error } = await supabase.from('notices').insert(notice);
    if (error) throw error;
};

export const updateNotice = async (id: string, notice: Partial<Notice>): Promise<void> => {
    const { error } = await supabase.from('notices').update(notice).eq('id', id);
    if (error) throw error;
};

export const deleteNotice = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

export const getClients = async (q?: string): Promise<Client[]> => {
    let query = supabase.from('clients').select('*');
    if (q) {
        if (q.match(/^\d+$/)) {
            query = query.ilike('phone', `%${q}%`);
        } else {
            query = query.ilike('name', `%${q}%`);
        }
    }
    const { data, error } = await query.order('name');
    if (error) throw error;
    return (data || []).map(c => ({
        ...c,
        isVip: c.is_vip
    }));
};

export const createClient = async (name: string, phone: string, isVip = false): Promise<Client> => {
    const cleanPhone = phone.replace(/\D/g,'');
    const { data, error } = await supabase
        .from('clients')
        .upsert({ name, phone: cleanPhone, is_vip: isVip }, { onConflict: 'phone' })
        .select()
        .single();
    if (error) throw error;
    return { ...data, isVip: data.is_vip };
};

export const updateClient = async (id: string, updateData: any): Promise<void> => {
    const dbData: any = { ...updateData };
    if (updateData.isVip !== undefined) {
        dbData.is_vip = updateData.isVip;
        delete dbData.isVip;
    }
    const { error } = await supabase.from('clients').update(dbData).eq('id', id);
    if (error) throw error;
};

export const deleteClient = async (id: string): Promise<void> => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
        console.error("Supabase Delete Error:", error);
        throw error; 
    }
};

export const getReservations = async (unitId: UnitId, date: string): Promise<Reservation[]> => {
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('unit_id', unitId)
        .eq('date', date)
        .order('time', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapReservation);
};

export const createReservation = async (res: any, client: Client): Promise<Reservation> => {
    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const userEmail = user?.email || 'SISTEMA';
    const historyEntry: HistoryEntry = {
        user: userEmail,
        action: 'Reserva Criada',
        timestamp: now
    };
    const dbPayload = {
        unit_id: res.unitId,
        client_id: client.id,
        client_name: client.name,
        client_phone: client.phone,
        date: res.date,
        time: res.time,
        people_count: res.people_count,
        event_type: res.eventType,
        area: res.area,
        table_number: res.table_number,
        special_notes: res.special_notes,
        notes_author: res.special_notes ? userEmail : null,
        status: res.status,
        history: [historyEntry],
        last_modified_by: userEmail,
        last_modified_at: now
    };
    const { data, error } = await supabase
        .from('reservations')
        .insert(dbPayload)
        .select()
        .single();
    if (error) throw error;
    return mapReservation(data);
};

export const updateReservation = async (id: string, updateData: any): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const userEmail = user?.email || 'SISTEMA';
    const dbPayload: any = {};
    let customAction = 'Dados Atualizados';
    if (updateData.peopleCount !== undefined) dbPayload.people_count = updateData.peopleCount;
    if (updateData.eventType !== undefined) dbPayload.event_type = updateData.eventType;
    if (updateData.area !== undefined) dbPayload.area = updateData.area;
    if (updateData.tableNumber !== undefined) dbPayload.table_number = updateData.tableNumber;
    if (updateData.specialNotes !== undefined) {
        dbPayload.special_notes = updateData.specialNotes;
        dbPayload.notes_author = userEmail; 
        customAction = 'Nota Atualizada';
    }
    if (updateData.date !== undefined) dbPayload.date = updateData.date;
    if (updateData.time !== undefined) dbPayload.time = updateData.time;
    if (updateData.status !== undefined) dbPayload.status = updateData.status;
    const { data: current } = await supabase.from('reservations').select('history').eq('id', id).single();
    const newHistory = [...(current?.history || []), {
        user: userEmail,
        action: customAction,
        timestamp: now
    }];
    dbPayload.history = newHistory;
    dbPayload.last_modified_by = userEmail;
    dbPayload.last_modified_at = now;
    const { error } = await supabase.from('reservations').update(dbPayload).eq('id', id);
    if (error) throw error;
};

export const deleteReservation = async (id: string): Promise<void> => {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) {
        console.error("Supabase Delete Error:", error);
        throw error;
    }
};

export const updateReservationStatus = async (id: string, status: ReservationStatus, count?: number, amount?: number): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const userEmail = user?.email || 'SISTEMA';
    const { data: current } = await supabase.from('reservations').select('history, client_id, date').eq('id', id).single();
    const actionText = status === ReservationStatus.COMPLETED 
        ? `Finalizado (Real: ${count}, R$ ${amount?.toFixed(2)})`
        : `Status alterado para ${getStatusLabel(status)}`;
    const newHistory = [...(current?.history || []), {
        user: userEmail,
        action: actionText,
        timestamp: now
    }];
    const { error } = await supabase
        .from('reservations')
        .update({
            status,
            confirmed_people_count: count,
            spent_amount: amount,
            history: newHistory,
            last_modified_by: userEmail,
            last_modified_at: now
        })
        .eq('id', id);
    if (error) throw error;
    if (status === ReservationStatus.COMPLETED && current?.client_id) {
        const { data: client } = await supabase.from('clients').select('visits').eq('id', current.client_id).single();
        const visits = client?.visits || [];
        if (!visits.includes(current.date)) {
            await supabase.from('clients').update({ visits: [...visits, current.date] }).eq('id', current.client_id);
        }
    }
};

export const getStatusLabelsMap = (): Record<string, string> => {
    const stored = localStorage.getItem('jotaka_status_labels');
    return stored ? JSON.parse(stored) : DEFAULT_LABELS;
};

export const updateStatusLabels = (labels: Record<ReservationStatus, string>) => {
    localStorage.setItem('jotaka_status_labels', JSON.stringify(labels));
};

export const resetStatusLabels = () => {
    localStorage.removeItem('jotaka_status_labels');
};

export const getStatusLabel = (status: ReservationStatus) => {
    const labels = getStatusLabelsMap();
    return labels[status] || status;
};

export const getUnits = () => UNITS;

export const getClientReservationCount = async (clientId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('status', ReservationStatus.COMPLETED);
    return count || 0;
};

export const getMonthlyReservationCounts = async (unitId: UnitId, year: number, month: number): Promise<Record<string, DailyCounts>> => {
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const { data: resData } = await supabase
        .from('reservations')
        .select('date, status, created_at')
        .eq('unit_id', unitId)
        .gte('date', startOfMonth.split('T')[0])
        .lte('date', endOfMonth.split('T')[0]);
    const counts: Record<string, DailyCounts> = {};
    resData?.forEach(r => {
        if (!counts[r.date]) counts[r.date] = { scheduled: 0, created: 0, noshows: 0 };
        if (r.status !== ReservationStatus.CANCELED) counts[r.date].scheduled++;
        if (r.status === ReservationStatus.NOSHOW) counts[r.date].noshows++;
        const creationDate = r.created_at.split('T')[0];
        if (!counts[creationDate]) counts[creationDate] = { scheduled: 0, created: 0, noshows: 0 };
        counts[creationDate].created++;
    });
    return counts;
};

export const getDashboardStats = async (unitId: UnitId, period: DashboardFilterPeriod) => {
    const now = new Date();
    let startDate = new Date();
    if (period === 'day') startDate.setHours(0,0,0,0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
    
    const dateStr = getLocalDateString();
    const queryDate = period === 'day' ? dateStr : startDate.toISOString().split('T')[0];

    const { data: resData } = await supabase
        .from('reservations')
        .select('*')
        .eq('unit_id', unitId)
        .gte('date', queryDate);
    const stats = {
        totalSpent: 0,
        totalPax: 0,
        totalRealPax: 0,
        avgTicket: 0,
        canceledCount: 0,
        noshows: 0,
        modifiedCount: 0,
        topAgendaDays: [] as any[],
        topCreationDays: [] as any[]
    };
    const agendaCounts: Record<string, number> = {};
    const creationCounts: Record<string, number> = {};
    resData?.forEach(r => {
        if (r.status === ReservationStatus.COMPLETED) {
            stats.totalSpent += (r.spent_amount || 0);
            stats.totalRealPax += (r.confirmed_people_count || 0);
        } else if (r.status === ReservationStatus.CHECKED_IN) {
            stats.totalRealPax += (r.people_count || 0);
        }
        stats.totalPax += r.people_count;
        if (r.status === ReservationStatus.CANCELED) stats.canceledCount++;
        if (r.status === ReservationStatus.NOSHOW) stats.noshows++;
        if (r.history && r.history.length > 1) stats.modifiedCount++;
        const d = r.date;
        agendaCounts[d] = (agendaCounts[d] || 0) + 1;
        const cd = r.created_at.split('T')[0];
        creationCounts[cd] = (creationCounts[cd] || 0) + 1;
    });
    stats.avgTicket = stats.totalRealPax > 0 ? stats.totalSpent / stats.totalRealPax : 0;
    stats.topAgendaDays = Object.entries(agendaCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label: label.split('-').reverse().slice(0, 2).join('/'), count }));
    stats.topCreationDays = Object.entries(creationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label: label.split('-').reverse().slice(0, 2).join('/'), count }));
    return stats;
};

export const getGlobalConsolidatedStats = async (period: DashboardFilterPeriod) => {
    const now = new Date();
    let startDate = new Date();
    if (period === 'day') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const dateStr = getLocalDateString();
    const queryDate = period === 'day' ? dateStr : startDate.toISOString().split('T')[0];

    const { data: resData } = await supabase
        .from('reservations')
        .select('*')
        .gte('date', queryDate);
    
    const globalStats = {
        totalSpent: 0,
        totalPax: 0,
        totalRealPax: 0,
        globalAvgTicket: 0,
        unitBreakdown: UNITS.map(u => ({
            id: u.id,
            name: u.name,
            spent: 0,
            pax: 0,
            realPax: 0,
            avgTicket: 0
        })),
        bestMonth: { name: 'Sem Histórico', pax: 0 }
    };

    const monthlyPax: Record<string, number> = {};

    resData?.forEach(r => {
        const unit = globalStats.unitBreakdown.find(u => u.id === r.unit_id);
        
        // Agrupar por mês para achar o recorde (YYYY-MM)
        const monthKey = r.date.substring(0, 7);
        
        if (unit) {
            if (r.status === ReservationStatus.COMPLETED) {
                const confirmed = r.confirmed_people_count || 0;
                unit.spent += (r.spent_amount || 0);
                unit.realPax += confirmed;
                globalStats.totalSpent += (r.spent_amount || 0);
                globalStats.totalRealPax += confirmed;
                
                monthlyPax[monthKey] = (monthlyPax[monthKey] || 0) + confirmed;
            } else if (r.status === ReservationStatus.CHECKED_IN) {
                const currentPax = r.people_count || 0;
                unit.realPax += currentPax;
                globalStats.totalRealPax += currentPax;
                monthlyPax[monthKey] = (monthlyPax[monthKey] || 0) + currentPax;
            }
            unit.pax += r.people_count;
            globalStats.totalPax += r.people_count;
        }
    });

    // Encontrar o melhor mês do período
    let maxMonthPax = 0;
    let bestMonthName = 'Aguardando Dados';
    
    Object.entries(monthlyPax).forEach(([key, value]) => {
        if (value > maxMonthPax) {
            maxMonthPax = value;
            const [y, m] = key.split('-');
            const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            bestMonthName = `${monthNames[parseInt(m)-1]}/${y}`;
        }
    });

    globalStats.bestMonth = { name: bestMonthName, pax: maxMonthPax };

    globalStats.unitBreakdown.forEach(u => {
        u.avgTicket = u.spent > 0 && u.realPax > 0 ? u.spent / u.realPax : 0;
    });
    globalStats.globalAvgTicket = globalStats.totalRealPax > 0 ? globalStats.totalSpent / globalStats.totalRealPax : 0;
    
    return globalStats;
};

export const exportDataToCSV = async (table: string, unitId: UnitId, period: DashboardFilterPeriod) => {
    const now = new Date();
    let startDate = new Date();
    if (period === 'day') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
    
    const dateStr = getLocalDateString();
    const queryDate = period === 'day' ? dateStr : startDate.toISOString().split('T')[0];

    const { data } = await supabase
        .from(table)
        .select('*')
        .eq('unit_id', unitId)
        .gte('date', queryDate);
    if (!data || data.length === 0) return alert("Sem dados para exportar.");
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj: any) => 
        Object.values(obj).map(val => {
            if (val === null || val === undefined) return "";
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(',')
    ).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jotaka_export_${unitId}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportGlobalDataToCSV = async (period: DashboardFilterPeriod) => {
    const now = new Date();
    let startDate = new Date();
    if (period === 'day') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const dateStr = getLocalDateString();
    const queryDate = period === 'day' ? dateStr : startDate.toISOString().split('T')[0];

    const { data } = await supabase
        .from('reservations')
        .select('*')
        .gte('date', queryDate);
    if (!data || data.length === 0) return alert("Sem dados para exportar.");
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj: any) => 
        Object.values(obj).map(val => {
            if (val === null || val === undefined) return "";
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(',')
    ).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jotaka_export_global_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const initSystem = async (): Promise<void> => { return; };
