import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingConfigApi } from '@/services/api';

interface Service {
  id: string;
  value: string;
  label: string;
}

interface Package {
  id: string;
  value: string;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

export const BookingConfigPage = () => {
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['booking-config'] });
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
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-dark">
          Booking Form Configuration
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Customize the booking form fields, services, packages, and questions
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
        {/* Sub-tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { id: 'services', label: 'Services' },
            { id: 'packages', label: 'Packages' },
            { id: 'questions', label: 'Custom Questions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base touch-manipulation ${
                activeSubTab === tab.id
                  ? 'border-b-2 border-primary-yellow text-primary-dark'
                  : 'text-gray-600 hover:text-primary-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {activeSubTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Add services that users can select when booking. Each service should have a unique value and display label.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-dark">Available Services</h3>
              <button
                onClick={addService}
                className="flex items-center gap-2 px-4 py-2 bg-primary-yellow text-primary-dark font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
              >
                <Plus size={16} /> Add Service
              </button>
            </div>

            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={service.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Service Value (Internal)
                      </label>
                      <input
                        type="text"
                        value={service.value}
                        onChange={(e) => updateService(service.id, { value: e.target.value })}
                        placeholder="wedding-photography"
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Display Label
                      </label>
                      <input
                        type="text"
                        value={service.label}
                        onChange={(e) => updateService(service.id, { label: e.target.value })}
                        placeholder="Wedding Photography"
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove service"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="allowCustomService"
                checked={allowCustomService}
                onChange={(e) => setAllowCustomService(e.target.checked)}
                className="w-4 h-4 text-primary-yellow focus:ring-primary-yellow rounded"
              />
              <label htmlFor="allowCustomService" className="text-sm font-medium text-gray-700">
                Allow users to specify custom service (Other option)
              </label>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeSubTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Add packages that users can select. Packages can include descriptions for more details.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-dark">Available Packages</h3>
              <button
                onClick={addPackage}
                className="flex items-center gap-2 px-4 py-2 bg-primary-yellow text-primary-dark font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
              >
                <Plus size={16} /> Add Package
              </button>
            </div>

            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex gap-3 items-start mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Package Value (Internal)
                        </label>
                        <input
                          type="text"
                          value={pkg.value}
                          onChange={(e) => updatePackage(pkg.id, { value: e.target.value })}
                          placeholder="basic-package"
                          className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => updatePackage(pkg.id, { label: e.target.value })}
                          placeholder="Basic Package"
                          className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removePackage(pkg.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remove package"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={pkg.description || ''}
                      onChange={(e) => updatePackage(pkg.id, { description: e.target.value })}
                      placeholder="Package details..."
                      rows={2}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="allowCustomPackage"
                checked={allowCustomPackage}
                onChange={(e) => setAllowCustomPackage(e.target.checked)}
                className="w-4 h-4 text-primary-yellow focus:ring-primary-yellow rounded"
              />
              <label htmlFor="allowCustomPackage" className="text-sm font-medium text-gray-700">
                Allow users to specify custom package (Other option)
              </label>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeSubTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Add custom questions to collect additional information from users during booking.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary-dark">Custom Questions</h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-primary-yellow text-primary-dark font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex gap-3 items-start mb-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Question Label
                      </label>
                      <input
                        type="text"
                        value={question.label}
                        onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                        placeholder="What is your preferred date?"
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remove question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Field Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Select Dropdown</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkboxes</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="w-4 h-4 text-primary-yellow focus:ring-primary-yellow rounded"
                      />
                      <label htmlFor={`required-${question.id}`} className="text-sm font-medium text-gray-700">
                        Required field
                      </label>
                    </div>
                  </div>

                  {/* Options for select/radio/checkbox */}
                  {['select', 'radio', 'checkbox'].includes(question.type) && (
                    <div className="border-t border-gray-300 pt-3 mt-3">
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2 mb-2">
                        {(question.options || []).map((opt, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="flex-1 px-3 py-2 bg-white rounded border border-gray-300 text-sm">
                              {opt}
                            </span>
                            <button
                              onClick={() => removeOption(question.id, idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={optionInput[question.id] || ''}
                          onChange={(e) => setOptionInput((prev) => ({ ...prev, [question.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && addOption(question.id)}
                          placeholder="Add option..."
                          className="flex-1 px-3 py-2 rounded border border-gray-300 focus:border-primary-yellow focus:outline-none text-sm"
                        />
                        <button
                          onClick={() => addOption(question.id)}
                          className="px-4 py-2 bg-primary-yellow text-primary-dark font-bold rounded hover:bg-yellow-500 transition-colors text-sm"
                        >
                          Add
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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
