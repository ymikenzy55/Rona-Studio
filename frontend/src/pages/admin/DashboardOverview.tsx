import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FolderOpen, Calendar, Mail, Clock, ArrowRight, CheckCircle, XCircle, AlertCircle, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/services/api';

const statCards = [
  {
    key: 'totalProjects',
    label: 'Total Projects',
    icon: FolderOpen,
    color: 'bg-primary-yellow/10 text-primary-dark',
    accent: 'border-primary-yellow',
    link: '/admin/projects',
  },
  {
    key: 'totalBookings',
    label: 'Total Bookings',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-600',
    accent: 'border-blue-400',
    link: '/admin/bookings',
  },
  {
    key: 'pendingBookings',
    label: 'Pending Bookings',
    icon: Clock,
    color: 'bg-orange-50 text-orange-600',
    accent: 'border-orange-400',
    link: '/admin/bookings',
  },
  {
    key: 'unreadMessages',
    label: 'Unread Messages',
    icon: Mail,
    color: 'bg-green-50 text-green-600',
    accent: 'border-green-400',
    link: '/admin/messages',
  },
];

const statusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <CheckCircle size={14} className="text-green-500" />;
    case 'cancelled': return <XCircle size={14} className="text-red-500" />;
    default: return <AlertCircle size={14} className="text-orange-400" />;
  }
};

export const DashboardOverview = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data.data;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-dark to-primary-dark/90 rounded-2xl p-5 text-white flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-display font-bold mb-1">Welcome back, Admin 👋</h2>
          <p className="text-white/60 text-sm">Here's what's happening with Rona Studio today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
          <Wifi size={14} className="text-green-400" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </motion.div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={card.link}
                className={`block bg-white rounded-2xl p-5 border-l-4 ${card.accent} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon size={20} />
                </div>
                <p className="text-2xl font-display font-bold text-primary-dark">
                  {statsData?.[card.key] ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-display font-bold text-primary-dark">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs text-primary-yellow hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 mx-4 my-3 rounded-xl" />)
            ) : statsData?.recentBookings?.length > 0 ? (
              statsData.recentBookings.map((booking: any) => (
                <div key={booking._id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-primary-dark truncate">{booking.personalDetails.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{booking.service} • {booking.package}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    {statusIcon(booking.status)}
                    <span className="text-xs capitalize text-gray-600">{booking.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-center text-sm text-gray-400">No recent bookings</p>
            )}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-display font-bold text-primary-dark">Recent Messages</h3>
            <Link to="/admin/messages" className="text-xs text-primary-yellow hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 mx-4 my-3 rounded-xl" />)
            ) : statsData?.recentMessages?.length > 0 ? (
              statsData.recentMessages.map((message: any) => (
                <div key={message._id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-primary-dark">{message.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{message.message}</p>
                    </div>
                    {!message.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary-yellow" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-center text-sm text-gray-400">No recent messages</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
      >
        <h3 className="font-display font-bold text-primary-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Project', link: '/admin/projects', icon: FolderOpen, bg: 'bg-primary-yellow/10 hover:bg-primary-yellow/20 text-primary-dark' },
            { label: 'View Bookings', link: '/admin/bookings', icon: Calendar, bg: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
            { label: 'Read Messages', link: '/admin/messages', icon: Mail, bg: 'bg-green-50 hover:bg-green-100 text-green-700' },
            { label: 'Edit Content', link: '/admin/content', icon: FolderOpen, bg: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.bg}`}
            >
              <action.icon size={22} />
              <span className="text-xs font-semibold text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
