import { Home, TrendingUp, CreditCard, FileText, Bell, Users, CalendarDays, ClipboardList, UserCircle, Activity, Stethoscope, History, Database, Settings, User, ShoppingCart, Layers, Video } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'analytics' | 'billing' | 'billing-dashboard' | 'individual-billing' | 'login' | 'documents' | 'notifications' | 'settings' | 'patients' | 'appointments' | 'appointment-queue' | 'reception-queue' | 'opd-queue' | 'doctor-queue' | 'patient-history' | 'data-repair' | 'pharmacy-billing' | 'medicine-management' | 'payment-setup' | 'organization-login' | 'admin-dashboard' | 'admin-data-management' | 'telemedicine';
  onViewChange: (view: 'dashboard' | 'analytics' | 'billing' | 'billing-dashboard' | 'individual-billing' | 'login' | 'documents' | 'notifications' | 'settings' | 'patients' | 'appointments' | 'appointment-queue' | 'reception-queue' | 'opd-queue' | 'doctor-queue' | 'patient-history' | 'data-repair' | 'pharmacy-billing' | 'medicine-management' | 'payment-setup' | 'organization-login' | 'admin-dashboard' | 'admin-data-management' | 'telemedicine') => void;
  userRole?: string;
  notificationCount?: number;
}

export function Sidebar({ currentView, onViewChange, userRole, notificationCount = 0 }: SidebarProps) {
  const isReception = userRole === 'receptionist' || userRole === 'reception';
  const isOpd = userRole === 'opd';
  const isDoctor = userRole === 'doctor';
  const isClinical = isOpd || isDoctor;
  
  const showAllQueues = !userRole || userRole === 'admin' || userRole === 'patient';
  
  // Hide specific queue icons if the user has a unified Portal (ReceptionistPortal or OpdPortal)
  const hideSpecificQueues = isReception || isClinical;
  
  const showBillingAndPharmacy = !isClinical && currentView !== 'opd-queue' && currentView !== 'doctor-queue';

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col items-center py-4 z-[200] shadow-[4px_0_24px_rgba(0,0,0,0.5)]">

      {/* Logo */}
      <div className="w-10 h-10 rounded-full mb-8 flex items-center justify-center transition-all duration-500 ease-out hover:shadow-[#D4A574]/40 hover:scale-105 cursor-pointer overflow-hidden">
        <img 
          src="/logo.jpeg"
          alt="Chakravue AI Logo" 
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover' 
          }} 
        />
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-3 flex-1">
        <button 
          onClick={() => onViewChange('login')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'login' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <User className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            {isReception ? 'Reception Portal' : isClinical ? 'Clinical Portal' : 'Login'}
          </div>
        </button>

        <button 
          onClick={() => onViewChange('dashboard')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'dashboard' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <Home className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Dashboard
          </div>
        </button>

        <button 
          onClick={() => onViewChange('analytics')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'analytics' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <TrendingUp className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110 group-hover:translate-y-[-1px]" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Analytics
          </div>
        </button>

        {showBillingAndPharmacy && (
        <button 
          onClick={() => onViewChange('individual-billing')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'individual-billing' || currentView === 'billing'
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <CreditCard className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Patient Billing
          </div>
        </button>
        )}

        {showBillingAndPharmacy && (
        <button 
          onClick={() => onViewChange('billing-dashboard')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'billing-dashboard' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <Layers className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Billing Dashboard
          </div>
        </button>
        )}
        {isDoctor && (
          <button 
            onClick={() => onViewChange('telemedicine')}
            className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
              currentView === 'telemedicine' 
                ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
                : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
            }`}
          >
            <Video className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
              Telemedicine
            </div>
          </button>
        )}
        <button 
          onClick={() => onViewChange('documents')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'documents' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <FileText className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Documents
          </div>
        </button>

        {showBillingAndPharmacy && (
        <button 
          onClick={() => onViewChange('pharmacy-billing')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'pharmacy-billing' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <ShoppingCart className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Pharmacy
          </div>
        </button>
        )}

        {showBillingAndPharmacy && (userRole === 'receptionist' || userRole === 'reception') && (
          <button 
            onClick={() => onViewChange('medicine-management')}
            className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
              currentView === 'medicine-management' 
                ? 'bg-gradient-to-br from-[#FF9D00] to-[#FFB133] text-[#0a0a0a] shadow-lg shadow-[#FF9D00]/30' 
                : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#FF9D00] hover:scale-105'
            }`}
          >
            <Activity className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#FF9D00] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
              Medicines
            </div>
          </button>
        )}

        <button 
          onClick={() => onViewChange('notifications')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'notifications' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <Bell className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0d0d0d] animate-pulse"></span>
          )}
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Notifications
          </div>
        </button>

        {/* Patient Directory completely removed per user request */}

        {/* Reception actions are now embedded in the "Reception Portal" Dashboard icon */}
        {!hideSpecificQueues && (
        <button 
          onClick={() => onViewChange('appointments')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'appointments' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <CalendarDays className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Appointments
          </div>
        </button>
        )}

        {!hideSpecificQueues && (
        <button 
          onClick={() => onViewChange('appointment-queue')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'appointment-queue' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
          title="Appointment Queue"
        >
          <ClipboardList className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Appointment Queue
          </div>
        </button>
        )}

        {!hideSpecificQueues && showAllQueues && (
        <button 
          onClick={() => onViewChange('reception-queue')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'reception-queue' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
          title="Reception Queue"
        >
          <UserCircle className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Reception Queue
          </div>
        </button>
        )}

        {(!hideSpecificQueues || showAllQueues) && !isClinical && (
        <button 
          onClick={() => onViewChange('opd-queue')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'opd-queue' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
          title="OPD Queue"
        >
          <Activity className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            OPD Queue
          </div>
        </button>
        )}

        {(!hideSpecificQueues || showAllQueues) && !isClinical && (
        <button 
          onClick={() => onViewChange('doctor-queue')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'doctor-queue' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
          title="Doctor Queue"
        >
          <Stethoscope className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Doctor Queue
          </div>
        </button>
        )}
      </nav>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => onViewChange('patient-history')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'patient-history' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
          title="Patient History"
        >
          <History className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-[-15deg]" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Patient History
          </div>
        </button>

        <button 
          onClick={() => onViewChange('data-repair')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'data-repair' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
          title="Data Repair"
        >
          <Database className="w-5 h-5 transition-all duration-500 ease-out group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Data Repair
          </div>
        </button>

        <button 
          onClick={() => onViewChange('settings')}
          className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ease-out ${
            currentView === 'settings' 
              ? 'bg-gradient-to-br from-[#D4A574] to-[#C89B67] text-[#0a0a0a] shadow-lg shadow-[#D4A574]/30' 
              : 'text-[#8B8B8B] hover:bg-[#1a1a1a] hover:text-[#D4A574] hover:scale-105'
          }`}
        >
          <Settings className="w-5 h-5 transition-all duration-500 ease-out group-hover:rotate-45 group-hover:scale-110" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] text-[#D4A574] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-[#2a2a2a]">
            Settings
          </div>
        </button>
      </div>
    </div>
  );
}