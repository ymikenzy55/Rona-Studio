import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ImagePicker } from '@/components/admin/ImagePicker';
import { uploadApi } from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HeroImagePicker = ({
  currentUrl,
  onUrlChange,
}: {
  currentUrl: string;
  onUrlChange: (url: string) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl);

  const handleFileSelect = async (file: File | null, _preview: string | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await uploadApi.uploadImage(file);
      onUrlChange(response.data.url);
      setUrlInput(response.data.url);
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-primary-yellow font-medium">
          <Loader2 size={16} className="animate-spin" /> Uploading to Cloudinary...
        </div>
      )}
      <ImagePicker
        value={currentUrl || undefined}
        onChange={handleFileSelect}
        label="Upload Background Image"
        aspectRatio="16/9"
        maxSizeMB={15}
      />
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Or paste an image URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => onUrlChange(urlInput)}
            className="px-4 py-2 bg-primary-yellow text-primary-dark font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
          >
            Use URL
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContentPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hero');
  const [editedContent, setEditedContent] = useState<any>({});

  const { data: content, isLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/site-content`);
      return response.data.data;
    },
  });

  const initMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/site-content/init`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success('Content initialized successfully! Please refresh the page.');
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: () => {
      toast.error('Failed to initialize content');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ section, content }: any) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/site-content/${section}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success('Content updated successfully');
      setEditedContent({});
    },
    onError: () => {
      toast.error('Failed to update content');
    },
  });

  const handleSave = (section: string) => {
    const contentToSave = editedContent[section] || content?.[section];
    if (!contentToSave) return;
    updateMutation.mutate({ section, content: contentToSave });
  };

  const updateField = (section: string, field: string, value: any) => {
    setEditedContent((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || content?.[section] || {}),
        [field]: value,
      },
    }));
  };

  const getCurrentContent = (section: string) => {
    return editedContent[section] || content?.[section] || {};
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">Could not load site content.</p>
        <p className="text-xs text-gray-400 mt-1">Make sure the backend server is running, then refresh.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      {/* Check if content is empty and show initialization button */}
      {(!content || Object.keys(content).length === 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-bold mb-1">
                ⚠️ Content Not Initialized
              </p>
              <p className="text-sm text-yellow-700">
                Your site content hasn't been set up yet. Click the button to initialize with default content.
              </p>
            </div>
            <button
              onClick={() => initMutation.mutate()}
              disabled={initMutation.isPending}
              className="ml-4 px-6 py-2 bg-primary-yellow text-primary-dark font-bold rounded-lg 
                       hover:bg-yellow-500 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {initMutation.isPending ? 'Initializing...' : 'Initialize Content'}
            </button>
          </div>
        </div>
      )}

      {/* Help Note */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Edit all text that appears on your website. Changes are saved to the database and appear immediately on the live site.
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-dark">
          Site Content Management
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Edit all text and content that appears on your website
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {['hero', 'about', 'services', 'contact', 'general'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold capitalize transition-colors whitespace-nowrap text-sm sm:text-base touch-manipulation ${
                activeTab === tab
                  ? 'border-b-2 border-primary-yellow text-primary-dark'
                  : 'text-gray-600 hover:text-primary-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Hero Title
              </label>
              <input
                type="text"
                value={getCurrentContent('hero').title || ''}
                onChange={(e) => updateField('hero', 'title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Hero Subtitle
              </label>
              <textarea
                value={getCurrentContent('hero').subtitle || ''}
                onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={getCurrentContent('hero').buttonText || ''}
                onChange={(e) => updateField('hero', 'buttonText', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-primary-dark mb-2">Background Image</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload an image or enter a URL for the hero background. Uploaded images are stored on Cloudinary.
              </p>

              <HeroImagePicker
                currentUrl={getCurrentContent('hero').backgroundImage || ''}
                onUrlChange={(url) => updateField('hero', 'backgroundImage', url)}
              />
            </div>

            <button
              onClick={() => handleSave('hero')}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark 
                       font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* About Section */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Section Badge
              </label>
              <input
                type="text"
                value={getCurrentContent('about').badge || ''}
                onChange={(e) => updateField('about', 'badge', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                About Title
              </label>
              <input
                type="text"
                value={getCurrentContent('about').title || ''}
                onChange={(e) => updateField('about', 'title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Description
              </label>
              <textarea
                value={getCurrentContent('about').description || ''}
                onChange={(e) => updateField('about', 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Quote
              </label>
              <textarea
                value={getCurrentContent('about').quote || ''}
                onChange={(e) => updateField('about', 'quote', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={() => handleSave('about')}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark 
                       font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Services Section */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Section Badge
              </label>
              <input
                type="text"
                value={getCurrentContent('services').badge || ''}
                onChange={(e) => updateField('services', 'badge', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Services Title
              </label>
              <input
                type="text"
                value={getCurrentContent('services').title || ''}
                onChange={(e) => updateField('services', 'title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Description
              </label>
              <textarea
                value={getCurrentContent('services').description || ''}
                onChange={(e) => updateField('services', 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                CTA Text
              </label>
              <input
                type="text"
                value={getCurrentContent('services').ctaText || ''}
                onChange={(e) => updateField('services', 'ctaText', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={getCurrentContent('services').ctaButton || ''}
                onChange={(e) => updateField('services', 'ctaButton', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-primary-dark mb-4">Services List</h3>
              <p className="text-sm text-gray-600 mb-4">
                Edit the services that appear on your website. Each service has a number, title, and description.
              </p>
              
              {(getCurrentContent('services').services || []).map((service: any, index: number) => (
                <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Number
                      </label>
                      <input
                        type="text"
                        value={service.number || ''}
                        onChange={(e) => {
                          const services = [...(getCurrentContent('services').services || [])];
                          services[index] = { ...services[index], number: e.target.value };
                          updateField('services', 'services', services);
                        }}
                        className="w-full px-3 py-2 rounded border border-gray-300 
                                 focus:border-primary-yellow focus:outline-none text-sm"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={service.title || ''}
                        onChange={(e) => {
                          const services = [...(getCurrentContent('services').services || [])];
                          services[index] = { ...services[index], title: e.target.value };
                          updateField('services', 'services', services);
                        }}
                        className="w-full px-3 py-2 rounded border border-gray-300 
                                 focus:border-primary-yellow focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={service.description || ''}
                      onChange={(e) => {
                        const services = [...(getCurrentContent('services').services || [])];
                        services[index] = { ...services[index], description: e.target.value };
                        updateField('services', 'services', services);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 rounded border border-gray-300 
                               focus:border-primary-yellow focus:outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSave('services')}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark 
                       font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Contact Section */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Section Badge
              </label>
              <input
                type="text"
                value={getCurrentContent('contact').badge || ''}
                onChange={(e) => updateField('contact', 'badge', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Contact Title
              </label>
              <input
                type="text"
                value={getCurrentContent('contact').title || ''}
                onChange={(e) => updateField('contact', 'title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Description
              </label>
              <textarea
                value={getCurrentContent('contact').description || ''}
                onChange={(e) => updateField('contact', 'description', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none resize-none text-sm md:text-base"
              />
            </div>

            {/* Contact Information Fields */}
            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-primary-dark mb-2">Contact Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                Edit phone, email, location, and hours that appear on the contact page.
              </p>
              
              <div className="space-y-4">
                {/* Phone */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={
                      (() => {
                        const contactInfo = getCurrentContent('contact').contactInfo;
                        if (Array.isArray(contactInfo) && contactInfo.length > 0) {
                          const phoneInfo = contactInfo.find(info => info.type === 'phone');
                          return phoneInfo?.value || '';
                        }
                        return '';
                      })()
                    }
                    onChange={(e) => {
                      const currentContactInfo = getCurrentContent('contact').contactInfo || [];
                      let contactInfo = [...currentContactInfo];
                      
                      // Ensure we have the default structure
                      if (contactInfo.length === 0) {
                        contactInfo = [
                          { type: 'phone', label: 'Phone', value: '', link: '' },
                          { type: 'email', label: 'Email', value: '', link: '' },
                          { type: 'location', label: 'Location', value: '', link: '' },
                          { type: 'hours', label: 'Hours', value: '', link: null }
                        ];
                      }
                      
                      // Find and update phone
                      const phoneIndex = contactInfo.findIndex(info => info.type === 'phone');
                      if (phoneIndex >= 0) {
                        contactInfo[phoneIndex] = { 
                          ...contactInfo[phoneIndex], 
                          value: e.target.value,
                          link: `tel:${e.target.value.replace(/\s/g, '')}`
                        };
                      } else {
                        contactInfo.unshift({ 
                          type: 'phone', 
                          label: 'Phone', 
                          value: e.target.value,
                          link: `tel:${e.target.value.replace(/\s/g, '')}`
                        });
                      }
                      
                      updateField('contact', 'contactInfo', contactInfo);
                    }}
                    placeholder="+233 123 456 789"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>

                {/* Email */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={
                      (() => {
                        const contactInfo = getCurrentContent('contact').contactInfo;
                        if (Array.isArray(contactInfo) && contactInfo.length > 0) {
                          const emailInfo = contactInfo.find(info => info.type === 'email');
                          return emailInfo?.value || '';
                        }
                        return '';
                      })()
                    }
                    onChange={(e) => {
                      const currentContactInfo = getCurrentContent('contact').contactInfo || [];
                      let contactInfo = [...currentContactInfo];
                      
                      if (contactInfo.length === 0) {
                        contactInfo = [
                          { type: 'phone', label: 'Phone', value: '', link: '' },
                          { type: 'email', label: 'Email', value: '', link: '' },
                          { type: 'location', label: 'Location', value: '', link: '' },
                          { type: 'hours', label: 'Hours', value: '', link: null }
                        ];
                      }
                      
                      const emailIndex = contactInfo.findIndex(info => info.type === 'email');
                      if (emailIndex >= 0) {
                        contactInfo[emailIndex] = { 
                          ...contactInfo[emailIndex], 
                          value: e.target.value,
                          link: `mailto:${e.target.value}`
                        };
                      } else {
                        contactInfo.push({ 
                          type: 'email', 
                          label: 'Email', 
                          value: e.target.value,
                          link: `mailto:${e.target.value}`
                        });
                      }
                      
                      updateField('contact', 'contactInfo', contactInfo);
                    }}
                    placeholder="hello@ronastudio.com"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>

                {/* Location */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Location/Address
                  </label>
                  <input
                    type="text"
                    value={
                      (() => {
                        const contactInfo = getCurrentContent('contact').contactInfo;
                        if (Array.isArray(contactInfo) && contactInfo.length > 0) {
                          const locationInfo = contactInfo.find(info => info.type === 'location');
                          return locationInfo?.value || '';
                        }
                        return '';
                      })()
                    }
                    onChange={(e) => {
                      const currentContactInfo = getCurrentContent('contact').contactInfo || [];
                      let contactInfo = [...currentContactInfo];
                      
                      if (contactInfo.length === 0) {
                        contactInfo = [
                          { type: 'phone', label: 'Phone', value: '', link: '' },
                          { type: 'email', label: 'Email', value: '', link: '' },
                          { type: 'location', label: 'Location', value: '', link: '' },
                          { type: 'hours', label: 'Hours', value: '', link: null }
                        ];
                      }
                      
                      const locationIndex = contactInfo.findIndex(info => info.type === 'location');
                      if (locationIndex >= 0) {
                        contactInfo[locationIndex] = { 
                          ...contactInfo[locationIndex], 
                          value: e.target.value,
                          link: 'https://maps.google.com'
                        };
                      } else {
                        contactInfo.push({ 
                          type: 'location', 
                          label: 'Location', 
                          value: e.target.value,
                          link: 'https://maps.google.com'
                        });
                      }
                      
                      updateField('contact', 'contactInfo', contactInfo);
                    }}
                    placeholder="123 Studio Street, Accra"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>

                {/* Hours */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    value={
                      (() => {
                        const contactInfo = getCurrentContent('contact').contactInfo;
                        if (Array.isArray(contactInfo) && contactInfo.length > 0) {
                          const hoursInfo = contactInfo.find(info => info.type === 'hours');
                          return hoursInfo?.value || '';
                        }
                        return '';
                      })()
                    }
                    onChange={(e) => {
                      const currentContactInfo = getCurrentContent('contact').contactInfo || [];
                      let contactInfo = [...currentContactInfo];
                      
                      if (contactInfo.length === 0) {
                        contactInfo = [
                          { type: 'phone', label: 'Phone', value: '', link: '' },
                          { type: 'email', label: 'Email', value: '', link: '' },
                          { type: 'location', label: 'Location', value: '', link: '' },
                          { type: 'hours', label: 'Hours', value: '', link: null }
                        ];
                      }
                      
                      const hoursIndex = contactInfo.findIndex(info => info.type === 'hours');
                      if (hoursIndex >= 0) {
                        contactInfo[hoursIndex] = { 
                          ...contactInfo[hoursIndex], 
                          value: e.target.value,
                          link: null
                        };
                      } else {
                        contactInfo.push({ 
                          type: 'hours', 
                          label: 'Hours', 
                          value: e.target.value,
                          link: null
                        });
                      }
                      
                      updateField('contact', 'contactInfo', contactInfo);
                    }}
                    placeholder="Mon-Fri: 9AM-6PM"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-primary-dark mb-2">Social Media Links</h3>
              <p className="text-sm text-gray-600 mb-4">
                Edit your social media profile URLs.
              </p>
              
              <div className="space-y-4">
                {/* Instagram */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={getCurrentContent('contact').socialLinks?.[0]?.url || 'https://instagram.com'}
                    onChange={(e) => {
                      const socialLinks = getCurrentContent('contact').socialLinks || [
                        { platform: 'Instagram', url: '' },
                        { platform: 'Facebook', url: '' },
                        { platform: 'Twitter', url: '' },
                        { platform: 'Dribbble', url: '' }
                      ];
                      socialLinks[0] = { platform: 'Instagram', url: e.target.value };
                      updateField('contact', 'socialLinks', socialLinks);
                    }}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>

                {/* Facebook */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={getCurrentContent('contact').socialLinks?.[1]?.url || 'https://facebook.com'}
                    onChange={(e) => {
                      const socialLinks = getCurrentContent('contact').socialLinks || [
                        { platform: 'Instagram', url: '' },
                        { platform: 'Facebook', url: '' },
                        { platform: 'Twitter', url: '' },
                        { platform: 'Dribbble', url: '' }
                      ];
                      socialLinks[1] = { platform: 'Facebook', url: e.target.value };
                      updateField('contact', 'socialLinks', socialLinks);
                    }}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>

                {/* Twitter */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={getCurrentContent('contact').socialLinks?.[2]?.url || 'https://twitter.com'}
                    onChange={(e) => {
                      const socialLinks = getCurrentContent('contact').socialLinks || [
                        { platform: 'Instagram', url: '' },
                        { platform: 'Facebook', url: '' },
                        { platform: 'Twitter', url: '' },
                        { platform: 'Dribbble', url: '' }
                      ];
                      socialLinks[2] = { platform: 'Twitter', url: e.target.value };
                      updateField('contact', 'socialLinks', socialLinks);
                    }}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>

                {/* Dribbble */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-bold text-primary-dark mb-2">
                    Dribbble URL
                  </label>
                  <input
                    type="url"
                    value={getCurrentContent('contact').socialLinks?.[3]?.url || 'https://dribbble.com'}
                    onChange={(e) => {
                      const socialLinks = getCurrentContent('contact').socialLinks || [
                        { platform: 'Instagram', url: '' },
                        { platform: 'Facebook', url: '' },
                        { platform: 'Twitter', url: '' },
                        { platform: 'Dribbble', url: '' }
                      ];
                      socialLinks[3] = { platform: 'Dribbble', url: e.target.value };
                      updateField('contact', 'socialLinks', socialLinks);
                    }}
                    placeholder="https://dribbble.com/yourprofile"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                             focus:border-primary-yellow focus:outline-none text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSave('contact')}
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark 
                       font-bold rounded-lg hover:bg-yellow-500 active:bg-yellow-600 transition-colors 
                       disabled:opacity-50 touch-manipulation"
            >
              <Save size={20} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* General Section */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={getCurrentContent('general').siteName || ''}
                onChange={(e) => updateField('general', 'siteName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={getCurrentContent('general').tagline || ''}
                onChange={(e) => updateField('general', 'tagline', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Copyright Text
              </label>
              <input
                type="text"
                value={getCurrentContent('general').copyrightText || ''}
                onChange={(e) => updateField('general', 'copyrightText', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleSave('general')}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark 
                       font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
