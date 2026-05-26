import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  Mail, 
  FileText,
  Settings,
  Image,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wifi,
  X,
} from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { path: '/admin/messages', icon: Mail, label: 'Messages' },
  { path: '/admin/content', icon: FileText, label: 'Site Content' },
  { path: '/admin/gallery', icon: Image, label: 'Gallery' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

// Defined OUTSIDE AdminSidebar so React never treats it as a new component type on re-renders
interface SidebarContentProps {
  mobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  setIsMobileOpen: (v: boolean) => void;
  onLogout: () => void;
  unreadCount: number;
}

const SidebarContent = ({
  mobile,
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen,
  onLogout,
  unreadCount,
}: SidebarContentProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-primary-dark text-white">
      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-white/10 transition-all duration-300 ${
        isCollapsed && !mobile ? 'justify-center px-3 py-4' : 'justify-between px-5 py-4'
      }`}>
        {(!isCollapsed || mobile) && (
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="Rona Studio" className="h-10 w-auto object-contain flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Admin Panel</p>
            </div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 
                       flex items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight size={16} className="text-white/70" />
              : <ChevronLeft size={16} className="text-white/70" />
            }
          </button>
        )}
        {mobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 
                       flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Live indicator */}
      {(!isCollapsed || mobile) && (
        <div className="px-5 py-3 flex items-center gap-2 border-b border-white/10">
          <Wifi size={12} className="text-green-400" />
          <span className="text-xs text-green-400 font-medium">Live • Connected</span>
        </div>
      )}
      {isCollapsed && !mobile && (
        <div className="flex justify-center py-3 border-b border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-400" title="Live connected" />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
          const showBadge = item.path === '/admin/messages' && unreadCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed && !mobile ? item.label : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200
                ${isActive
                  ? 'bg-primary-yellow text-primary-dark font-bold shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
                ${isCollapsed && !mobile ? 'justify-center' : ''}
              `}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {(!isCollapsed || mobile) && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {showBadge && (!isCollapsed || mobile) && (
                <span className="ml-auto flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {showBadge && isCollapsed && !mobile && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-primary-dark" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={() => { setIsMobileOpen(false); onLogout(); }}
          title={isCollapsed && !mobile ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-3
                     text-white/60 hover:bg-red-500/20 hover:text-red-400
                     transition-all duration-200
                     ${isCollapsed && !mobile ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {(!isCollapsed || mobile) && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export const AdminSidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onLogout,
}: AdminSidebarProps) => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, setIsMobileOpen]);

  const contentProps: SidebarContentProps = {
    mobile: false,
    isCollapsed,
    setIsCollapsed,
    setIsMobileOpen,
    onLogout,
    unreadCount,
  };

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50 transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent {...contentProps} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="fixed left-0 top-0 h-screen w-72 z-[70] lg:hidden"
            >
              <SidebarContent {...contentProps} mobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
