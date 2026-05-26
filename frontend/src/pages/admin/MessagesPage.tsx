import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactApi } from '@/services/api';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';

const FILTER_TABS = ['all', 'unread', 'read'] as const;

export const MessagesPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const response = await contactApi.getAll();
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => contactApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => toast.error('Failed to mark as read'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Message deleted');
    },
    onError: () => toast.error('Failed to delete message'),
  });

  const filtered = messages?.filter((m: any) => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'read') return m.isRead;
    return true;
  }) ?? [];

  const counts = {
    all: messages?.length ?? 0,
    unread: messages?.filter((m: any) => !m.isRead).length ?? 0,
    read: messages?.filter((m: any) => m.isRead).length ?? 0,
  };

  const handleExpand = (id: string, isRead: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead) markAsReadMutation.mutate(id);
  };

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm border border-gray-100">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize touch-manipulation
              ${filter === tab
                ? 'bg-primary-dark text-white shadow'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            {tab}
            {counts[tab as keyof typeof counts] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold
                ${filter === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {counts[tab as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Mail size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} messages</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((message: any) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border transition-colors
                  ${!message.isRead ? 'border-primary-yellow/60' : 'border-gray-100'}`}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(message._id, message.isRead)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm
                      ${!message.isRead ? 'bg-primary-yellow text-primary-dark' : 'bg-gray-100 text-gray-500'}`}>
                      {message.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-display font-bold truncate ${!message.isRead ? 'text-primary-dark' : 'text-gray-700'}`}>
                          {message.name}
                        </p>
                        {!message.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-yellow" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {message.subject || message.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                    {expandedId === message._id
                      ? <ChevronUp size={16} className="text-gray-400" />
                      : <ChevronDown size={16} className="text-gray-400" />
                    }
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedId === message._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><span className="font-semibold text-primary-dark">From:</span> {message.name} &lt;{message.email}&gt;</p>
                          {message.phone && (
                            <p><span className="font-semibold text-primary-dark">Phone:</span> {message.phone}</p>
                          )}
                          {message.subject && (
                            <p><span className="font-semibold text-primary-dark">Subject:</span> {message.subject}</p>
                          )}
                          <p><span className="font-semibold text-primary-dark">Received:</span> {new Date(message.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                          {message.message}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href={`mailto:${message.email}?subject=Re: ${message.subject || 'Your message'}`}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white rounded-xl hover:bg-primary-dark/90 font-semibold text-sm transition-colors"
                          >
                            <Mail size={15} /> Reply
                          </a>
                          {!message.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsReadMutation.mutate(message._id); }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 font-semibold text-sm transition-colors"
                            >
                              <CheckCircle size={15} /> Mark Read
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: message._id }); }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 font-semibold text-sm transition-colors ml-auto"
                          >
                            <Trash2 size={15} /> Delete
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
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
