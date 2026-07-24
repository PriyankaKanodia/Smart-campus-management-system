import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Bell, 
  Calendar, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList,
  BookMarked,
  Building,
  UserCheck,
  Home,
  Bus,
  Package,
  Award,
  DollarSign,
  Sparkles,
  MessageSquare,
  BarChart2,
  ShieldCheck,
  Scan
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty', 'student'] },
    { id: 'biometrics', label: 'Biometric Attendance', icon: Scan, roles: ['admin', 'faculty', 'student'] },
    { id: 'communication', label: 'Real-Time Chat', icon: MessageSquare, roles: ['admin', 'faculty', 'student'] },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart2, roles: ['admin', 'faculty'] },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck, roles: ['admin', 'faculty', 'student'] },
    { id: 'ai-hub', label: 'AI Smart Hub', icon: Sparkles, roles: ['admin', 'faculty', 'student'] },
    { id: 'library', label: 'Library Catalog', icon: BookMarked, roles: ['admin', 'faculty', 'student'] },
    { id: 'departments', label: 'Departments', icon: Building, roles: ['admin'] },
    { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['admin', 'faculty', 'student'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'faculty'] },
    { id: 'faculty', label: 'Faculty Directory', icon: Users, roles: ['admin'] },
    { id: 'admissions', label: 'Admissions', icon: UserCheck, roles: ['admin'] },
    { id: 'hostel', label: 'Hostel & Housing', icon: Home, roles: ['admin', 'student'] },
    { id: 'transport', label: 'Transport Fleet', icon: Bus, roles: ['admin', 'student'] },
    { id: 'inventory', label: 'Assets & Inventory', icon: Package, roles: ['admin'] },
    { id: 'scholarships', label: 'Scholarships', icon: Award, roles: ['admin', 'student'] },
    { id: 'payroll', label: 'Staff Payroll', icon: DollarSign, roles: ['admin'] },
    { id: 'fees', label: 'Fees & Invoices', icon: CreditCard, roles: ['admin', 'student'] },
    { id: 'timetable', label: 'Timetable', icon: Calendar, roles: ['admin', 'faculty', 'student'] },
    { id: 'notices', label: 'Notices', icon: Bell, roles: ['admin', 'faculty', 'student'] },
    { id: 'reports', label: 'Reports & Logs', icon: FileText, roles: ['admin'] }
  ];


  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role || 'student'));

  return (
    <aside 
      className={`bg-[#0f172a] text-slate-200 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white font-display text-lg tracking-wider">
                S
              </div>
              <div>
                <h1 className="font-display font-semibold text-sm tracking-tight text-white leading-none">SmartCampus</h1>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">v1.2.0-Alpha</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mx-auto font-bold text-white font-display text-lg">
              S
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 hidden md:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Badge Profile Section */}
        <div className={`p-4 border-b border-slate-800/60 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? (
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">Signed in as:</p>
              <h4 className="font-medium text-slate-100 truncate text-sm mt-0.5 font-display">{user?.name}</h4>
              <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full mt-2 font-semibold tracking-wider uppercase ${
                user?.role === 'admin' 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : user?.role === 'faculty'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {user?.role}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-display flex items-center justify-center mx-auto text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-3 border-t border-slate-800/60">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
