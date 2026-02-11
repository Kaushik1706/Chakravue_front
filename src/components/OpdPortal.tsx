import { useState, useEffect } from 'react';
import { CalendarPlus, ClipboardList, UserCircle, User, LogOut, ChevronRight, LayoutDashboard, Search, Settings, Bell, Plus, Zap, Activity, Stethoscope } from 'lucide-react';
import { OperationsCenter } from './OperationsCenter';
import API_ENDPOINTS from '../config/api';

interface OpdPortalProps {
  username: string;
  userRole?: string;
  onLogout: () => void;
  onViewChange: (view: any) => void;
  onPatientSelected?: (patient: any) => void;
}

type PortalView = 'dashboard' | 'ops-center';

export function OpdPortal({ username, userRole, onLogout, onViewChange, onPatientSelected }: OpdPortalProps) {
  const [activeTab, setActiveTab] = useState<PortalView>('dashboard');
  const [stats, setStats] = useState({ opdWaiting: 0, doctorConsulting: 0, status: 'Live' });

  const isDoctor = userRole === 'doctor';

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [opdRes, docRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.QUEUE_OPD}?status=waiting`),
        fetch(`${API_ENDPOINTS.QUEUE_DOCTOR}?status=waiting`)
      ]);
      const opdData = await opdRes.json();
      const docData = await docRes.json();

      const opdToday = (opdData.items || []).filter((item: any) => {
        const itemDate = item.appointmentDate || (item.receptionData && item.receptionData.appointmentDate);
        return itemDate === today;
      }).length;

      const docToday = (docData.items || []).filter((item: any) => {
        const itemDate = item.appointmentDate || (item.receptionData && item.receptionData.appointmentDate);
        return itemDate === today;
      }).length;

      setStats({
        opdWaiting: opdToday,
        doctorConsulting: docToday,
        status: 'Optimal'
      });
    } catch (e) {
      console.error('OPD Stats fetch failed');
    }
  };

  useEffect(() => {
    fetchStats();
    window.addEventListener('opdQueueUpdated', fetchStats);
    window.addEventListener('doctorQueueUpdated', fetchStats);
    const interval = setInterval(fetchStats, 10000);
    return () => {
      window.removeEventListener('opdQueueUpdated', fetchStats);
      window.removeEventListener('doctorQueueUpdated', fetchStats);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'dashboard' as PortalView, label: 'OPD Command Center', icon: LayoutDashboard, desc: 'Clinic Overview' },
    { id: 'ops-center' as PortalView, label: 'Operations Hub', icon: Zap, desc: 'Unified Queue Monitoring' },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] overflow-hidden">
      {/* Portal Sidebar Navigation */}
      <div className="w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col p-6">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4A574]/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#D4A574]" />
            </div>
            <span className="text-[#D4A574] text-xs font-bold uppercase tracking-widest">{isDoctor ? 'Lead Physician' : 'Clinical Team'}</span>
          </div>
          <h2 className="text-xl font-medium text-white px-1">{isDoctor ? 'Dr.,' : 'Dept.,'} <br /><span className="text-[#D4A574]">{username}</span></h2>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${activeTab === item.id
                ? 'bg-gradient-to-r from-[#D4A574]/10 to-transparent border border-[#D4A574]/20'
                : 'hover:bg-[#121212] border border-transparent'
                }`}
            >
              <div className={`p-2.5 rounded-xl transition-all duration-300 ${activeTab === item.id
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
            <span className="text-sm font-bold">Sign Out</span>
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#080808] to-[#050505] overflow-hidden">

        {/* Dynamic Content Area */}
        <div className={`flex-1 scrollbar-hide p-12 ${activeTab === 'ops-center' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-light text-white tracking-tight">{isDoctor ? "Doctor's" : "Clinical"} <span className="text-[#D4A574] font-medium">Command Center</span></h2>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-bold">Flow Status: Connected</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <button
                  onClick={() => setActiveTab('ops-center')}
                  className="group bg-[#0f0f0f] border border-[#1a1a1a] p-8 rounded-[40px] hover:border-[#D4A574]/30 transition-all relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                    <ClipboardList className="w-24 h-24 text-[#D4A574]" />
                  </div>
                  <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">OPD Queue</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-light text-white leading-none">{stats.opdWaiting.toString().padStart(2, '0')}</h4>
                    <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">Waiting</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-[#444]">
                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                    <span>Initial Screening</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('ops-center')}
                  className="group bg-[#0f0f0f] border border-[#1a1a1a] p-8 rounded-[40px] hover:border-[#D4A574]/30 transition-all relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                    <Stethoscope className="w-24 h-24 text-[#D4A574]" />
                  </div>
                  <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Doctor Cabinet</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-light text-white leading-none">{stats.doctorConsulting.toString().padStart(2, '0')}</h4>
                    <span className="text-xs text-red-500 font-bold uppercase tracking-widest">In Consultation</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-[#444]">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    <span>Physician Review</span>
                  </div>
                </button>

                <div className="group bg-[#0f0f0f] border border-[#1a1a1a] p-8 rounded-[40px] relative overflow-hidden text-left bg-gradient-to-br from-[#0f0f0f] to-[#121212]">
                  <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Efficiency Map</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-light text-white leading-none">{stats.status}</h4>
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">System Status</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-[#444]">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    <span>All Stations Active</span>
                  </div>
                </div>
              </div>

              {/* Quick Access Section */}
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] p-10 rounded-[48px] relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <h4 className="text-2xl font-bold text-white mb-2">Patient Flow Hub</h4>
                  <p className="text-[#8B8B8B] text-sm mb-8 leading-relaxed">
                    View a unified list of all scheduled appointments and active clinic visitors. Track patient journey from check-in to discharge in one place.
                  </p>
                  <button
                    onClick={() => setActiveTab('ops-center')}
                    className="bg-white text-[#0a0a0a] px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    Open Clinical Monitoring <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-1/2 right-[5%] -translate-y-1/2 opacity-5 pointer-events-none">
                  <Zap className="w-64 h-64 text-white" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ops-center' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full">
              <div className="h-full">
                <OperationsCenter onPatientSelected={onPatientSelected} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
