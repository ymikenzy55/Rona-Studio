import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsApi } from '@/services/api';
import axios from 'axios';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
}

export const ProjectModal = ({ isOpen, onClose, project }: ProjectModalProps) => {
  const queryClient = useQueryClient();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  interface Section {
    id: string;
    title: string;
    description: string;
    mediaFile?: File;
    mediaPreview?: string;
    mediaUrl?: string;
  }
  const [sections, setSections] = useState<Section[]>([]);
  const sectionFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const selectedCategory = watch('category');

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`);
      return response.data.data;
    },
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setValue('title', project.title);
      setValue('description', project.description);
      setValue('category', project.category);
      setValue('client', project.client || '');
      setValue('date', project.date || '');
      setValue('featured', project.featured || false);
      setExistingImages(project.images || []);
      setSections(
        (project.sections || []).map((s: any) => ({
          id: s._id || Math.random().toString(36).slice(2),
          title: s.title || '',
          description: s.description || '',
          mediaUrl: s.mediaUrl || '',
        }))
      );
    } else {
      reset();
      setExistingImages([]);
      setImageFiles([]);
      setImagePreviews([]);
      setNewCategory('');
      setSections([]);
    }
  }, [project, reset, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('client', data.client || '');
      formData.append('date', data.date || '');
      formData.append('featured', data.featured);

      // Add existing images
      existingImages.forEach((img) => {
        formData.append('existingImages[]', img);
      });

      // Add new image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Add sections JSON (metadata) and section media files
      const sectionsMetadata = sections.map(({ title, description, mediaUrl }, i) => ({
        title,
        description,
        mediaUrl: mediaUrl || '',
        order: i,
      }));
      formData.append('sections', JSON.stringify(sectionsMetadata));
      // Append section media files in order (only new ones)
      sections.forEach((sec) => {
        if (sec.mediaFile) {
          formData.append('sectionMedia', sec.mediaFile);
        }
      });

      if (project) {
        return projectsApi.update(project._id, formData);
      } else {
        return projectsApi.create(formData);
      }
    },
    onSuccess: async () => {
      // Refetch queries to ensure instant update
      await queryClient.refetchQueries({ queryKey: ['admin-projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['gallery-projects'] });
      toast.success(project ? 'Project updated successfully' : 'Project created successfully');
      onClose();
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      setSections([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save project');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    const categoryToUse = data.category;
    if (!categoryToUse) {
      toast.error('Please select a category');
      return;
    }
    mutation.mutate({ ...data, category: categoryToUse });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl 
                   max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10 flex-shrink-0 rounded-t-3xl sm:rounded-t-3xl">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-primary-dark">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-primary-dark mb-2">
              Project Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:border-primary-yellow focus:outline-none"
              placeholder="e.g., Sarah & John's Wedding"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-primary-dark mb-2">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                       focus:border-primary-yellow focus:outline-none"
            >
              <option value="">Select a category</option>
              {categoriesData?.map((cat: any) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>
            )}
            {/* Inline new category */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!newCategory.trim()) return;
                    const token = localStorage.getItem('token');
                    axios.post(
                      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`,
                      { name: newCategory.trim() },
                      { headers: { Authorization: `Bearer ${token}` } }
                    ).then(() => {
                      queryClient.invalidateQueries({ queryKey: ['categories'] });
                      setValue('category', newCategory.trim());
                      setNewCategory('');
                      toast.success('Category created');
                    }).catch(() => toast.error('Failed to create category'));
                  }
                }}
                placeholder="+ New category (type & press Enter)"
                className="flex-1 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300
                         focus:border-primary-yellow focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCategory.trim()) return;
                  const token = localStorage.getItem('token');
                  axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`,
                    { name: newCategory.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                  ).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['categories'] });
                    setValue('category', newCategory.trim());
                    setNewCategory('');
                    toast.success('Category created');
                  }).catch(() => toast.error('Failed to create category'));
                }}
                className="px-3 py-2 bg-primary-yellow text-primary-dark rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors flex-shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-primary-dark mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:border-primary-yellow focus:outline-none resize-none"
              placeholder="Describe the project..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>
            )}
          </div>

          {/* Client & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Client Name
              </label>
              <input
                type="text"
                {...register('client')}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                         focus:border-primary-yellow focus:outline-none"
                placeholder="Client name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                Date
              </label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                         focus:border-primary-yellow focus:outline-none
                         [color-scheme:light] text-primary-dark"
              />
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('featured')}
              id="featured"
              className="w-5 h-5 rounded border-2 border-gray-300 text-primary-yellow 
                       focus:ring-primary-yellow"
            />
            <label htmlFor="featured" className="text-sm font-bold text-primary-dark">
              Featured Project (Show on homepage)
            </label>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-primary-dark">Project Sections</label>
              <button
                type="button"
                onClick={() =>
                  setSections((prev) => [
                    ...prev,
                    { id: Math.random().toString(36).slice(2), title: '', description: '', mediaType: 'image' },
                  ])
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-yellow text-primary-dark rounded-lg font-bold text-xs hover:bg-yellow-500 transition-colors"
              >
                <Plus size={14} /> Add Section
              </button>
            </div>

            {sections.length === 0 && (
              <p className="text-xs text-gray-400 py-2">No sections added. Sections let you add extra images with captions to a project.</p>
            )}

            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div key={sec.id} className="border-2 border-gray-100 rounded-xl p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => setSections((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>

                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section {idx + 1}</p>

                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => setSections((prev) => prev.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))}
                    placeholder="Section title (optional)"
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm"
                  />

                  <textarea
                    value={sec.description}
                    onChange={(e) => setSections((prev) => prev.map((s, i) => i === idx ? { ...s, description: e.target.value } : s))}
                    placeholder="Section description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none text-sm resize-none"
                  />

                  {/* Media upload */}
                  {sec.mediaPreview || sec.mediaUrl ? (
                    <div className="relative group">
                      <img src={sec.mediaPreview || sec.mediaUrl} alt="section" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setSections((prev) => prev.map((s, i) => i === idx ? { ...s, mediaFile: undefined, mediaPreview: undefined, mediaUrl: undefined } : s))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-yellow hover:bg-yellow-50/50 transition-all">
                      <ImageIcon size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                      <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { sectionFileRefs.current[idx] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSections((prev) =>
                              prev.map((s, i) =>
                                i === idx
                                  ? { ...s, mediaFile: file, mediaPreview: reader.result as string }
                                  : s
                              )
                            );
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-bold text-primary-dark mb-2">
              Project Images *
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg 
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg 
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 
                           border-dashed border-gray-300 rounded-lg cursor-pointer 
                           hover:border-primary-yellow transition-colors">
              <Upload size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload images</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-4 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 
                       font-bold rounded-lg hover:bg-gray-50 transition-colors touch-manipulation order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full sm:flex-1 px-6 py-3 bg-primary-yellow text-primary-dark 
                       font-bold rounded-lg hover:bg-yellow-500 transition-colors 
                       disabled:opacity-50 touch-manipulation order-1 sm:order-2"
            >
              {mutation.isPending ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};
