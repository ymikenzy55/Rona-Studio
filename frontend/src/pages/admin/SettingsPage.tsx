import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Lock, Users, Camera, Trash2, Plus, Eye, EyeOff, X, ClipboardList, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, bookingConfigApi } from '@/services/api';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';

const inputCls = 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'admins', label: 'Admin Users', icon: Users },
    { id: 'booking-form', label: 'Booking Form', icon: ClipboardList },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all touch-manipulation flex-1 justify-center
              ${activeTab === tab.id ? 'bg-primary-dark text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'admins' && <AdminsTab queryClient={queryClient} />}
          {activeTab === 'booking-form' && <BookingFormTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─── Profile Tab ─────────────────────────────────────── */
const ProfileTab = () => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await authApi.verify();
      return res.data.data.user;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: { name: profile?.name || '', email: profile?.email || '' },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      if (avatarFile) fd.append('avatar', avatarFile);
      return authApi.updateProfile(fd);
    },
    onSuccess: () => {
      toast.success('Profile updated');
      setAvatarFile(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update profile'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const avatarSrc = avatarPreview || profile?.avatar;

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-primary-dark flex items-center justify-center overflow-hidden">
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-primary-yellow font-bold text-3xl">{profile?.name?.[0]?.toUpperCase() || 'A'}</span>
            }
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-yellow rounded-lg flex items-center justify-center shadow hover:bg-yellow-500 transition-colors"
          >
            <Camera size={13} className="text-primary-dark" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-bold text-primary-dark">{profile?.name || 'Admin'}</p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-primary-yellow font-semibold mt-1 hover:underline">
            Change photo
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-primary-dark mb-1.5">Full Name</label>
        <input {...register('name', { required: 'Name is required' })} className={inputCls} placeholder="Your name" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-primary-dark mb-1.5">Email Address</label>
        <input type="email" {...register('email', { required: 'Email is required' })} className={inputCls} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary-yellow text-primary-dark font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
      >
        <Save size={16} />
        {mutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

/* ─── Security Tab ────────────────────────────────────── */
const SecurityTab = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const newPwd = watch('newPassword');

  const mutation = useMutation({
    mutationFn: (data: any) => authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => { toast.success('Password changed successfully'); reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl space-y-5">
      <h3 className="font-bold text-primary-dark">Change Password</h3>

      {[
        { name: 'currentPassword', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
        { name: 'newPassword', label: 'New Password', show: showNew, toggle: () => setShowNew(v => !v), minLen: 8 },
        { name: 'confirmPassword', label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
      ].map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-bold text-primary-dark mb-1.5">{f.label}</label>
          <div className="relative">
            <input
              type={f.show ? 'text' : 'password'}
              {...register(f.name as any, {
                required: `${f.label} is required`,
                ...(f.minLen ? { minLength: { value: f.minLen, message: `Min ${f.minLen} characters` } } : {}),
                ...(f.name === 'confirmPassword' ? { validate: (v: string) => v === newPwd || 'Passwords do not match' } : {}),
              })}
              className={`${inputCls} pr-11`}
            />
            <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {f.show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors[f.name] && <p className="text-red-500 text-xs mt-1">{(errors[f.name] as any).message}</p>}
        </div>
      ))}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary-yellow text-primary-dark font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
      >
        <Lock size={16} />
        {mutation.isPending ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
};

/* ─── Admin Management Tab ────────────────────────────── */
const AdminsTab = ({ queryClient }: { queryClient: any }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: '' });

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await authApi.getAdmins();
      return res.data.data;
    },
  });

  const { data: me } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await authApi.verify();
      return res.data.data.user;
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (data: any) => authApi.createAdmin(data),
    onSuccess: () => {
      toast.success('Admin added successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      reset();
      setShowAddForm(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add admin'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteAdmin(id),
    onSuccess: () => {
      toast.success('Admin removed');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setDeleteConfirm({ open: false, id: null, name: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to remove admin'),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-primary-dark">Admin Users</h3>
            <p className="text-xs text-gray-500 mt-0.5">{admins?.length || 0} admin{admins?.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-yellow text-primary-dark font-bold rounded-xl hover:bg-yellow-500 transition-colors text-sm"
          >
            {showAddForm ? <X size={15} /> : <Plus size={15} />}
            {showAddForm ? 'Cancel' : 'Add Admin'}
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit((d) => createMutation.mutate(d))}
              className="mb-5 p-4 bg-gray-50 rounded-xl space-y-3 overflow-hidden"
            >
              <p className="text-sm font-bold text-primary-dark">New Admin Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input {...register('name')} placeholder="Name (optional)" className={inputCls} />
                </div>
                <div>
                  <input type="email" {...register('email', { required: 'Email required' })} placeholder="Email *" className={inputCls} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{(errors.email as any).message}</p>}
                </div>
                <div>
                  <input type="password" {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} placeholder="Password *" className={inputCls} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{(errors.password as any).message}</p>}
                </div>
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-primary-dark text-white font-bold rounded-xl text-sm hover:bg-primary-dark/80 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Admin'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Admin list */}
        {isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {admins?.map((admin: any) => {
              const isMe = admin._id === me?._id;
              return (
                <div key={admin._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {admin.avatar
                      ? <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                      : <span className="text-primary-yellow font-bold text-sm">{admin.name?.[0]?.toUpperCase() || 'A'}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-primary-dark truncate">
                      {admin.name || 'Admin'} {isMe && <span className="text-xs text-primary-yellow font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                  </div>
                  {!isMe && (
                    <button
                      onClick={() => setDeleteConfirm({ open: true, id: admin._id, name: admin.name || admin.email })}
                      className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={() => deleteMutation.mutate(deleteConfirm.id!)}
        title="Remove Admin"
        message={`Remove "${deleteConfirm.name}" as an admin? They will lose all access.`}
        confirmText="Remove"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

/* ─── Booking Form Tab ─────────────────────────────────── */
type QuestionType = 'text' | 'textarea' | 'select' | 'radio';

interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

interface Service {
  id: string;
  value: string;
  label: string;
}

interface Package {
  id: string;
  value: string;
  label: string;
  description: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Choices' },
];

const BookingFormTab = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'packages' | 'questions'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allowCustomService, setAllowCustomService] = useState(true);
  const [allowCustomPackage, setAllowCustomPackage] = useState(true);
  const [optionInput, setOptionInput] = useState<Record<string, string>>({});

  const { isLoading } = useQuery({
    queryKey: ['booking-config'],
    queryFn: async () => {
      const res = await bookingConfigApi.getConfig();
      const data = res.data.data;
      setServices(data?.services || []);
      setPackages(data?.packages || []);
      setQuestions(
        (data?.questions || []).map((q: any) => ({
          id: q.id,
          label: q.label,
          type: q.type || 'text',
          options: q.options || [],
          required: q.required || false,
        }))
      );
      setAllowCustomService(data?.allowCustomService !== false);
      setAllowCustomPackage(data?.allowCustomPackage !== false);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => bookingConfigApi.saveConfig({ services, packages, questions, allowCustomService, allowCustomPackage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-config'] });
      toast.success('Booking configuration saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  // Service functions
  const addService = () => {
    const id = Math.random().toString(36).slice(2);
    setServices((prev) => [...prev, { id, value: '', label: '' }]);
  };

  const updateService = (id: string, patch: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Package functions
  const addPackage = () => {
    const id = Math.random().toString(36).slice(2);
    setPackages((prev) => [...prev, { id, value: '', label: '', description: '' }]);
  };

  const updatePackage = (id: string, patch: Partial<Package>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // Question functions
  const addQuestion = () => {
    const id = Math.random().toString(36).slice(2);
    setQuestions((prev) => [
      ...prev,
      { id, label: '', type: 'text', options: [], required: false },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addOption = (qId: string) => {
    const val = (optionInput[qId] || '').trim();
    if (!val) return;
    updateQuestion(qId, {
      options: [...(questions.find((q) => q.id === qId)?.options || []), val],
    });
    setOptionInput((prev) => ({ ...prev, [qId]: '' }));
  };

  const removeOption = (qId: string, optIdx: number) => {
    const q = questions.find((x) => x.id === qId);
    if (!q) return;
    updateQuestion(qId, { options: q.options.filter((_, i) => i !== optIdx) });
  };

  if (isLoading) {
    return <div className="bg-white rounded-2xl p-8 text-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex gap-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'services', label: 'Services' },
          { id: 'packages', label: 'Packages' },
          { id: 'questions', label: 'Questions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all touch-manipulation
              ${activeSubTab === tab.id ? 'bg-primary-dark text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {activeSubTab === 'services' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-primary-dark text-lg">Services</h3>
              <p className="text-xs text-gray-500 mt-0.5">Configure available services for booking</p>
            </div>
            <button
              onClick={addService}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-yellow text-primary-dark rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
            >
              <Plus size={15} /> Add Service
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowCustomService}
              onChange={(e) => setAllowCustomService(e.target.checked)}
              className="w-4 h-4 accent-primary-yellow"
            />
            Allow users to enter custom service (if not listed)
          </label>

          {services.length === 0 && (
            <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-sm">No services yet. Click "Add Service" to create one.</p>
            </div>
          )}

          <div className="space-y-3">
            {services.map((service, idx) => (
              <div key={service.id} className="border-2 border-gray-100 rounded-xl p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                    S{idx + 1}
                  </span>
                  <input
                    value={service.label}
                    onChange={(e) => updateService(service.id, { label: e.target.value })}
                    placeholder="Service name (e.g., Wedding Photography)"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="pl-0 sm:pl-6">
                  <input
                    value={service.value}
                    onChange={(e) => updateService(service.id, { value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="Value (e.g., wedding-photography)"
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lowercase, use hyphens instead of spaces</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages Tab */}
      {activeSubTab === 'packages' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-primary-dark text-lg">Packages</h3>
              <p className="text-xs text-gray-500 mt-0.5">Configure available packages for booking</p>
            </div>
            <button
              onClick={addPackage}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-yellow text-primary-dark rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
            >
              <Plus size={15} /> Add Package
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowCustomPackage}
              onChange={(e) => setAllowCustomPackage(e.target.checked)}
              className="w-4 h-4 accent-primary-yellow"
            />
            Allow users to enter custom package (if not listed)
          </label>

          {packages.length === 0 && (
            <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-sm">No packages yet. Click "Add Package" to create one.</p>
            </div>
          )}

          <div className="space-y-3">
            {packages.map((pkg, idx) => (
              <div key={pkg.id} className="border-2 border-gray-100 rounded-xl p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                    P{idx + 1}
                  </span>
                  <input
                    value={pkg.label}
                    onChange={(e) => updatePackage(pkg.id, { label: e.target.value })}
                    placeholder="Package name (e.g., Premium)"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => removePackage(pkg.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="pl-0 sm:pl-6 space-y-2">
                  <input
                    value={pkg.value}
                    onChange={(e) => updatePackage(pkg.id, { value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="Value (e.g., premium)"
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />
                  <input
                    value={pkg.description}
                    onChange={(e) => updatePackage(pkg.id, { description: e.target.value })}
                    placeholder="Description (e.g., Full day coverage)"
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeSubTab === 'questions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-primary-dark text-lg">Custom Questions</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Add custom questions users must answer when booking
              </p>
            </div>
            <button
              onClick={addQuestion}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-yellow text-primary-dark rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
            >
              <Plus size={15} /> Add Question
            </button>
          </div>

          {questions.length === 0 && (
            <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No custom questions yet.</p>
            </div>
          )}

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="border-2 border-gray-100 rounded-xl p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                    Q{idx + 1}
                  </span>
                  <input
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    placeholder="Question label"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 pl-0 sm:pl-6">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType, options: [] })}
                    className="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                      className="w-4 h-4 accent-primary-yellow"
                    />
                    Required
                  </label>
                </div>

                {(q.type === 'select' || q.type === 'radio') && (
                  <div className="pl-0 sm:pl-6 space-y-2">
                    <p className="text-xs font-semibold text-gray-500">Options:</p>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">{opt}</span>
                        <button
                          onClick={() => removeOption(q.id, oi)}
                          className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        value={optionInput[q.id] || ''}
                        onChange={(e) => setOptionInput((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(q.id); } }}
                        placeholder="Type option & press Enter"
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                      />
                      <button
                        onClick={() => addOption(q.id)}
                        className="px-3 py-2 bg-primary-yellow text-primary-dark rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-end">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-dark text-white rounded-xl font-bold text-sm hover:bg-primary-dark/90 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saveMutation.isPending ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};
