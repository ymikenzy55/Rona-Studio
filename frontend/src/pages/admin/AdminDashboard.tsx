import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { motion } from 'framer-motion';
import { Menu, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { ProjectsPage } from './ProjectsPage';
import { BookingsPage } from './BookingsPage';
import { MessagesPage } from './MessagesPage';
import { DashboardOverview } from './DashboardOverview';
import { ContentPage } from './ContentPage';
import { GalleryPage } from './GalleryPage';
import { SettingsPage } from './SettingsPage';
import { socketService } from '@/services/socket';
import { useNotificationStore } from '@/store/notificationStore';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/projects': 'Portfolio Projects',
  '/admin/bookings': 'Bookings',
  '/admin/messages': 'Messages',
  '/admin/content': 'Site Content',
  '/admin/gallery': 'Gallery',
  '/admin/settings': 'Settings',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await authApi.verify();
      return res.data.data.user;
    },
    enabled: isAuthenticated,
  });

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = socketService.connect('admin');

    // On reconnect, refresh all queries so any missed socket events are caught
    socket.on('connect', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

    socket.on('new-booking', (data: any) => {
      addNotification({
        type: 'booking',
        message: data.message,
        data: data.data,
        timestamp: new Date(data.timestamp),
        route: '/admin/bookings',
      });
      toast.success(data.message, { icon: '📅', duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

    socket.on('new-message', (data: any) => {
      addNotification({
        type: 'message',
        message: data.message,
        data: data.data,
        timestamp: new Date(data.timestamp),
        route: '/admin/messages',
      });
      toast.success(data.message, { icon: '✉️', duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

    return () => {
      socket.off('connect');
      socket.off('new-booking');
      socket.off('new-message');
    };
  }, [isAuthenticated, addNotification, queryClient]);

  const confirmLogout = () => {
    logout();
    socketService.disconnect();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="overflow-hidden bg-gray-50 flex" style={{ height: '100dvh' }}>
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Main area — shifts right of sidebar on desktop */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
        ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Top header — always visible, never scrolls away */}
        <header className="flex-shrink-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} className="text-gray-700" />
              </button>

              {/* Page title */}
              <div>
                <motion.h1
                  key={pageTitle}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-display font-bold text-primary-dark"
                >
                  {pageTitle}
                </motion.h1>
                <p className="text-xs text-gray-500 hidden sm:block">Rona Studio Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
                title="Visit site"
              >
                <ExternalLink size={13} /> Visit Site
              </a>
              <NotificationBell />
              <div className="w-9 h-9 rounded-full bg-primary-dark flex items-center justify-center text-primary-yellow font-bold text-sm ml-1 overflow-hidden flex-shrink-0">
                {profile?.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : <span>{profile?.name?.[0]?.toUpperCase() || 'A'}</span>
                }
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content — min-h-0 required for flex overflow on iOS */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 pb-8">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 bg-white border-t border-gray-100 py-3 px-6">
          <p className="text-center text-xs text-gray-400">
            Built by{' '}
            <a
              href="https://portfolio-sooty-eight-54.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-yellow hover:underline font-semibold"
            >
              Miqrotek
            </a>
          </p>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default AdminDashboard;
