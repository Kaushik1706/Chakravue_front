import { useState, useEffect } from 'react';
import { CalendarPlus, ClipboardList, UserCircle, User, LogOut, ChevronRight, LayoutDashboard, Search, Settings, Bell, Plus, Zap, Activity } from 'lucide-react';
import { AppointmentBookingView } from './AppointmentBookingView';
import { OperationsCenter } from './OperationsCenter';
import API_ENDPOINTS from '../config/api';

interface ReceptionistPortalProps {
  username: string;
  onLogout: () => void;
  onViewChange: (view: any) => void;
  onPatientSelected?: (patient: any) => void;
}

type PortalView = 'dashboard' | 'booking' | 'ops-center';

export function ReceptionistPortal({ username, onLogout, onViewChange, onPatientSelected }: ReceptionistPortalProps) {
  const [activeTab, setActiveTab] = useState<PortalView>('dashboard');
  const [stats, setStats] = useState({ bookings: 0, waiting: 0, active: 'Active' });

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [apptRes, recRes] = await Promise.all([
        fetch(API_ENDPOINTS.APPOINTMENTS),
        fetch(`${API_ENDPOINTS.QUEUE_RECEPTION}?status=waiting`)
      ]);
      const apptData = await apptRes.json();
      const recData = await recRes.json();

      const todayBookings = (apptData.appointments || []).filter((a: any) => 
        a.appointmentDate && a.appointmentDate.startsWith(today)
      ).length;

      const waitingToday = (recData.items || []).filter((item: any) => {
        const itemDate = item.appointmentDate || (item.receptionData && item.receptionData.appointmentDate);
        return itemDate === today;
      }).length;

      setStats({
        bookings: todayBookings,
        waiting: waitingToday,
        active: 'Live'
      });
    } catch (e) {
      console.error('Stats fetch failed');
    }
  };

  useEffect(() => {
    fetchStats();
    window.addEventListener('receptionQueueUpdated', fetchStats);
    const interval = setInterval(fetchStats, 10000);
    return () => {
      window.removeEventListener('receptionQueueUpdated', fetchStats);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'dashboard' as PortalView, label: 'Workspace Home', icon: LayoutDashboard, desc: 'Overview & Status' },
    { id: 'booking' as PortalView, label: 'Fix Appointment', icon: CalendarPlus, desc: 'New Patient Booking' },
    { id: 'ops-center' as PortalView, label: 'Operations Hub', icon: Zap, desc: 'Manage Patient Flow' },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#050505] rounded-3xl border border-[#1a1a1a] overflow-hidden shadow-2xl">
      {/* Portal Sidebar Navigation */}
      <div className="w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col p-6">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4A574]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#D4A574]" />
            </div>
            <span className="text-[#D4A574] text-xs font-bold uppercase tracking-widest">Receptionist</span>
          </div>
          <h2 className="text-xl font-medium text-white px-1">Welcome, <br/><span className="text-[#D4A574]">{username}</span></h2>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#D4A574]/10 to-transparent border border-[#D4A574]/20' 
                  : 'hover:bg-[#121212] border border-transparent'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-[#D4A574] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/20' 
                  : 'bg-[#1a1a1a] text-[#6B6B6B] group-hover:text-[#D4A574]'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold transition-colors ${activeTab === item.id ? 'text-white' : 'text-[#8B8B8B] group-hover:text-white'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-[#555] group-hover:text-[#888]">{item.desc}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-[#1a1a1a]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
          >
            <span className="text-sm font-bold">End Session</span>
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#080808] to-[#050505] overflow-hidden">
        {/* Header toolbar */}
        <div className="h-16 border-b border-[#1a1a1a] flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white">
              {navItems.find(i => i.id === activeTab)?.label}
            </h3>
            <ChevronRight className="w-3 h-3 text-[#333]" />
            <span className="text-[#555] text-xs">Reception Desk</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input 
                type="text" 
                placeholder="Search patient record..." 
                className="bg-[#121212] border border-[#222] rounded-full pl-10 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A574]/50 w-64 transition-all"
              />
            </div>
            <div className="w-px h-6 bg-[#222]"></div>
            <button className="p-2 text-[#6B6B6B] hover:text-[#D4A574] transition-colors relative">
               <Bell className="w-4 h-4" />
               <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#D4A574] rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#222] ${activeTab === 'ops-center' ? 'p-4' : 'p-8'}`}>
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-light text-white tracking-tight">System <span className="text-[#D4A574] font-medium">Overview</span></h2>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-bold">Node: Reception_Desk_01 // Live Data Stream</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <button 
                  onClick={() => setActiveTab('booking')}
                  className="group bg-[#0f0f0f] border border-[#1a1a1a] p-8 rounded-[40px] hover:border-[#D4A574]/30 transition-all relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                    <CalendarPlus className="w-24 h-24 text-[#D4A574]" />
                  </div>
                  <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Today's Load</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-light text-white leading-none">{stats.bookings.toString().padStart(2, '0')}</h4>
                    <span className="text-xs text-green-500 font-bold uppercase tracking-widest">Scheduled</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-[#444]">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span>System Sync Active</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('ops-center')}
                  className="group bg-[#0f0f0f] border border-[#1a1a1a] p-8 rounded-[40px] hover:border-[#D4A574]/30 transition-all relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                    <Activity className="w-24 h-24 text-[#D4A574]" />
                  </div>
                  <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Live Patient Flow</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-light text-white leading-none">{stats.waiting.toString().padStart(2, '0')}</h4>
                    <span className="text-xs text-[#D4A574] font-bold uppercase tracking-widest">At Desk</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-[#444]">
                    <div className="w-1 h-1 bg-[#D4A574] rounded-full"></div>
                    <span>Awaiting Check-in</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('ops-center')}
                  className="group bg-[#0f0f0f] border border-[#1a1a1a] p-8 rounded-[40px] hover:border-[#D4A574]/30 transition-all relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                    <Zap className="w-24 h-24 text-[#D4A574]" />
                  </div>
                  <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Queue Capacity</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-light text-white leading-none">{stats.active}</h4>
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">Optimal</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-[#444]">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    <span>Healthy Flow Range</span>
                  </div>
                </button>
              </div>

              <div className="max-w-3xl">
                {/* Quick Action Card */}
                <div className="flex flex-col gap-6">
                  <div className="bg-gradient-to-br from-[#D4A574] to-[#C89B67] p-8 rounded-3xl h-full flex flex-col justify-between text-[#0a0a0a]">
                    <div>
                      <h4 className="text-2xl font-bold mb-2">Registration Desk</h4>
                      <p className="text-[#0a0a0a]/70 text-sm mb-6">Start a new patient registration or book a quick follow-up appointment for existing records.</p>
                      <button 
                        onClick={() => setActiveTab('booking')}
                        className="bg-[#0a0a0a] text-[#D4A574] px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                      >
                        <Plus className="w-5 h-5" /> New Appointment
                      </button>
                    </div>
                    <div className="mt-8 pt-8 border-t border-[#0a0a0a]/10 flex justify-between items-center overflow-hidden h-20">
                      <div className="opacity-20 translate-y-4">
                        <CalendarPlus className="w-32 h-32" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
               <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-3xl p-8 shadow-2xl">
                 <AppointmentBookingView />
               </div>
            </div>
          )}

          {activeTab === 'ops-center' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-3xl p-4 md:p-8 shadow-2xl overflow-hidden">
                 <OperationsCenter onPatientSelected={onPatientSelected} />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

