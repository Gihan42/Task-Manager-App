
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModeToggle } from '../components/ModeToggle';

export const AppLayout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: KanbanSquare, label: 'Boards', path: '/boards' },
    { icon: Users, label: 'Team', path: '/team' },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside style={{ 
        width: isCollapsed ? '70px' : 'var(--sidebar-width)', 
        borderRight: '1px solid hsl(var(--border))', 
        backgroundColor: 'hsl(var(--card))',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20
      }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border))', height: '64px' }}>
          {!isCollapsed && (
             <h1 className="font-bold text-xl truncate animate-fade-in" style={{ color: 'hsl(var(--primary))' }}>
                TaskFlow
             </h1>
          )}
          <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={`p-2 rounded-lg transition-all ${isCollapsed ? 'mx-auto' : ''}`}
             style={{
               background: 'hsl(var(--muted) / 0.5)',
               backdropFilter: 'blur(10px)',
               border: '1px solid hsl(var(--border) / 0.5)',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
               cursor: 'pointer',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'scale(1.1)';
               e.currentTarget.style.background = 'hsl(var(--primary) / 0.1)';
               e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.3)';
               e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'scale(1)';
               e.currentTarget.style.background = 'hsl(var(--muted) / 0.5)';
               e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.5)';
               e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
             }}
             title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
             {isCollapsed ? <ChevronRight size={18} className="text-primary" /> : <ChevronLeft size={18} className="text-primary" />}
          </button>
        </div>
        
        <nav className="flex-1 p-3">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      textDecoration: 'none',
                      color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                      backgroundColor: isActive ? 'hsl(var(--secondary))' : 'transparent',
                      fontWeight: isActive ? 500 : 400,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span className="animate-fade-in truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
           <button style={{
             display: 'flex',
             alignItems: 'center',
             gap: '0.75rem',
             width: '100%',
             padding: '0.75rem',
             background: 'none',
             border: 'none',
             color: 'hsl(var(--muted-foreground))',
             cursor: 'pointer',
             justifyContent: isCollapsed ? 'center' : 'flex-start',
             borderRadius: 'var(--radius)',
           }}
           className="hover:bg-muted/50 transition-colors"
           title={isCollapsed ? "Logout" : undefined}
           >
             <LogOut size={20} />
             {!isCollapsed && <span className="animate-fade-in truncate">Logout</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content bg-muted/20" style={{ flex: 1, minWidth: 0 }}>
        <header className="flex justify-between items-center mb-8 animate-fade-in">
            <h2 className="text-xl font-bold">Welcome back!</h2>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(var(--primary))' }}></div>
            </div>
        </header>
        <div className="animate-slide-up">
            <Outlet />
        </div>
      </main>
    </div>
  );
};
