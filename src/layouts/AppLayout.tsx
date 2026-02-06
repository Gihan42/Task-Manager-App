
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModeToggle } from '../components/ModeToggle';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: KanbanSquare, label: 'Boards', path: '/boards' },
    { icon: Users, label: 'Team', path: '/team' },
  ];

  return (
    <div className="layout-container relative min-h-screen flex">
      {/* Global Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[100px]" />
         {/* Floating Shapes */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="floating-shape shape-1 opacity-20" />
            <div className="floating-shape shape-2 opacity-20" />
            <div className="floating-shape shape-3 opacity-20" />
         </div>
      </div>

      {/* Sidebar */}
      <aside style={{ 
        width: isCollapsed ? '70px' : 'var(--sidebar-width)', 
        borderRight: '1px solid hsl(var(--border) / 0.3)', 
        background: 'linear-gradient(180deg, hsl(var(--card) / 0.4) 0%, hsl(var(--card) / 0.2) 100%)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 20
      }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border) / 0.3)', height: '64px', flexShrink: 0 }}>
          {!isCollapsed && (
             <h1 className="font-bold text-xl truncate animate-fade-in" style={{ color: 'hsl(var(--primary))' }}>
                TaskFlow
             </h1>
          )}
          <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={`p-2 rounded-lg transition-all ${isCollapsed ? 'mx-auto' : ''}`}
             style={{
               background: 'hsl(var(--muted) / 0.4)',
               backdropFilter: 'blur(4px)',
               border: '1px solid hsl(var(--border) / 0.4)',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
               cursor: 'pointer',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'scale(1.1)';
               e.currentTarget.style.background = 'hsl(var(--primary) / 0.2)';
               e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)';
               e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'scale(1)';
               e.currentTarget.style.background = 'hsl(var(--muted) / 0.4)';
               e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.4)';
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
                      backgroundColor: isActive ? 'hsl(var(--secondary) / 0.8)' : 'transparent',
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

        <div className="p-3" style={{ borderTop: '1px solid hsl(var(--border) / 0.3)', flexShrink: 0 }}>
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
           onClick={logout}
           >
             <LogOut size={20} />
             {!isCollapsed && <span className="animate-fade-in truncate">Logout</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, minWidth: 0, background: 'transparent', position: 'relative', zIndex: 10 }}>
        <header className="flex justify-between items-center mb-8 animate-fade-in">
            <h2 className="text-xl font-bold">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h2>
            <div className="flex items-center gap-4">
                <ModeToggle />
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm border border-primary/20">
                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        </header>
        <div className="animate-slide-up">
            <Outlet />
        </div>
      </main>
    </div>
  );
};
