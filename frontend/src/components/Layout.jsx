import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, BrainCircuit, BarChart3, Settings, LogOut, FileText } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Datasets', icon: Database, path: '/datasets' },
    { name: 'Analysis', icon: BarChart3, path: '/analysis' },
    { name: 'AI Models', icon: BrainCircuit, path: '/models' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
      {/* Sidebar background styling */}
      <div className="w-72 border-r border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between backdrop-blur-xl z-20">
        <div>
          <Link to="/" className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20 flex items-center justify-center">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">NexAI</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = path === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'bg-primary/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-primary/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-accent' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2">
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
             <Settings className="w-5 h-5" />
             <span className="font-medium">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all">
             <LogOut className="w-5 h-5" />
             <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        {/* Soft background glows for dashboard */}
        <div className="fixed top-[-30%] left-[20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="p-10 relative z-10">
          <div className="glass border border-white/10 bg-white/5 p-4 rounded-2xl mb-8 flex justify-between items-center backdrop-blur-md">
            <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Welcome back, Akram.</h2>
               <p className="text-sm text-slate-400">Here's your data intelligence overview today.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/20"></div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
