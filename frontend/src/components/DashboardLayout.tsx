import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  LayoutDashboard,
  BarChart3,
  FileText,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { LampToggle } from '@/components/LampToggle';
import { cn } from '@/lib/utils';
import { checkDatabaseConnection } from '@/api/health';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChart3, label: 'Trends', path: '/trends' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: CreditCard, label: 'Pricing', path: '/pricing' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; checking: boolean }>({
    connected: true,
    checking: true
  });
  const location = useLocation();

  useEffect(() => {
    const checkDB = async () => {
      try {
        const result = await checkDatabaseConnection();
        setDbStatus({ connected: result.connected, checking: false });
      } catch (error) {
        console.error('Failed to check database status:', error);
        setDbStatus({ connected: false, checking: false });
      }
    };

    checkDB();
    // Check every 30 seconds
    const interval = setInterval(checkDB, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-sidebar-foreground"
              >
                Vibe Analytics
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="p-4 flex justify-center">
          <LampToggle />
        </div>

        {/* Database Status */}
        <div className="px-4 pb-2">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
            dbStatus.checking
              ? 'bg-muted text-muted-foreground'
              : dbStatus.connected
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {dbStatus.checking ? (
              <Database className="w-3 h-3 animate-pulse" />
            ) : dbStatus.connected ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {!collapsed && (
              <span className="font-medium">
                {dbStatus.checking ? 'Checking DB...' : dbStatus.connected ? 'DB Connected' : 'DB Disconnected'}
              </span>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/login"
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
              'text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </motion.aside>

      {/* Main content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
