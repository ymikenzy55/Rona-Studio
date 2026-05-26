import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Mail, Phone, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi } from '@/services/api';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled'] as const;

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  confirmed: 'bg-green-100 text-green-700 border border-green-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
  completed: 'bg-blue-100 text-blue-700 border border-blue-200',
};

export const BookingsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await bookingsApi.getAll();
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(`Booking ${status}`);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Booking deleted');
    },
    onError: () => toast.error('Failed to delete booking'),
  });

  const filtered = bookings?.filter((b: any) => activeTab === 'all' || b.status === activeTab) ?? [];

  const counts: Record<string, number> = {
    all: bookings?.length ?? 0,
    pending: bookings?.filter((b: any) => b.status === 'pending').length ?? 0,
    confirmed: bookings?.filter((b: any) => b.status === 'confirmed').length ?? 0,
    cancelled: bookings?.filter((b: any) => b.status === 'cancelled').length ?? 0,
  };

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm border border-gray-100 overflow-x-auto hide-scrollbar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap capitalize touch-manipulation
              ${activeTab === tab
                ? 'bg-primary-dark text-white shadow'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold
                ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No {activeTab !== 'all' ? activeTab : ''} bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((booking: any) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-dark/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-dark font-bold text-sm">
                        {booking.personalDetails.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-primary-dark truncate">
                        {booking.personalDetails.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {booking.service} • {booking.package}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[booking.status] || statusStyles.pending}`}>
                      {booking.status}
                    </span>
                    <button
                      onClick={() => setExpandedId(expandedId === booking._id ? null : booking._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {expandedId === booking._id
                        ? <ChevronUp size={16} className="text-gray-500" />
                        : <ChevronDown size={16} className="text-gray-500" />
                      }
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedId === booking._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail size={15} className="text-gray-400 flex-shrink-0" />
                            <span className="break-all">{booking.personalDetails.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={15} className="text-gray-400 flex-shrink-0" />
                            <span>{booking.personalDetails.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                            <span>Preferred: {new Date(booking.preferredDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            Submitted: {new Date(booking.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {booking.personalDetails.message && (
                          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 break-words">
                            <span className="font-semibold text-primary-dark block mb-1">Message:</span>
                            {booking.personalDetails.message}
                          </div>
                        )}

                        {booking.customAnswers && booking.customAnswers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Answers</p>
                            {booking.customAnswers.map((ans: any, i: number) => (
                              <div key={i} className="bg-blue-50 rounded-xl p-3 text-sm">
                                <p className="font-semibold text-primary-dark">{ans.question}</p>
                                <p className="text-gray-700 mt-0.5 break-words">{ans.answer || <span className="italic text-gray-400">No answer</span>}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: booking._id, status: 'confirmed' })}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 font-semibold text-sm transition-colors disabled:opacity-50 touch-manipulation"
                              >
                                <CheckCircle size={16} /> Confirm
                              </button>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: booking._id, status: 'cancelled' })}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-semibold text-sm transition-colors disabled:opacity-50 touch-manipulation"
                              >
                                <XCircle size={16} /> Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: booking._id, status: 'completed' })}
                              disabled={updateStatusMutation.isPending}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-semibold text-sm transition-colors disabled:opacity-50 touch-manipulation"
                            >
                              <CheckCircle size={16} /> Mark Complete
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm({ open: true, id: booking._id })}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 font-semibold text-sm transition-colors touch-manipulation ml-auto"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => {
          if (deleteConfirm.id) deleteMutation.mutate(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: null });
        }}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
