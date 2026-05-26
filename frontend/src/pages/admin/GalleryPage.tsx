import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Grid, List, Plus } from 'lucide-react';
import { projectsApi } from '@/services/api';
import { ProjectModal } from '@/components/admin/ProjectModal';

export const GalleryPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['gallery-projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data.data;
    },
  });

  const categories = ['all', 'Wedding', 'Corporate', 'Fashion', 'Portrait', 'Event', 'Product'];

  const filteredProjects = projects?.filter((project: any) => 
    selectedCategory === 'all' || project.category === selectedCategory
  );

  // Flatten all images from all projects
  const allImages = filteredProjects?.flatMap((project: any) => 
    (project.images || []).map((img: string) => ({
      url: img,
      projectTitle: project.title,
      category: project.category,
      projectId: project._id,
    }))
  ) || [];

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
        {/* Category filter - scrollable */}
        <div className="overflow-x-auto flex-1 hide-scrollbar">
          <div className="flex gap-1.5 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition-all whitespace-nowrap touch-manipulation
                  ${selectedCategory === cat
                    ? 'bg-primary-dark text-white shadow'
                    : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Gallery button */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-primary-yellow text-primary-dark font-bold rounded-xl hover:bg-yellow-500 transition-colors text-xs"
        >
          <Plus size={14} /> Add
        </button>

        {/* View toggle */}
        <div className="flex gap-1 flex-shrink-0 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-primary-dark' : 'text-gray-500'}`}
            aria-label="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-primary-dark' : 'text-gray-500'}`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Count */}
      {!isLoading && allImages.length > 0 && (
        <p className="text-xs text-gray-400 px-1">
          {allImages.length} image{allImages.length !== 1 ? 's' : ''}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </p>
      )}

      {/* Gallery */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
        </div>
      ) : allImages.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No images found</p>
          <p className="text-xs text-gray-400 mt-1">
            {selectedCategory === 'all' ? 'Add projects with images to see them here' : `No images in ${selectedCategory} category`}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allImages.map((image: any, index: number) => (
            <motion.div
              key={`${image.projectId}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(index * 0.02, 0.3) }}
              onClick={() => setLightbox(image.url)}
              className="group relative aspect-square rounded-2xl overflow-hidden 
                       shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
            >
              <img
                src={image.url}
                alt={image.projectTitle}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <div>
                  <p className="text-white font-bold text-xs line-clamp-1">{image.projectTitle}</p>
                  <p className="text-white/70 text-xs">{image.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {allImages.map((image: any, index: number) => (
            <motion.div
              key={`${image.projectId}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.3) }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-3 hover:shadow-md transition-all"
            >
              <img
                src={image.url}
                alt={image.projectTitle}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-primary-dark truncate">{image.projectTitle}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs mt-1">
                  {image.category}
                </span>
              </div>
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-4 py-2 bg-primary-yellow text-primary-dark font-semibold rounded-xl hover:bg-yellow-500 transition-colors text-xs"
              >
                Open
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <ProjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        project={null}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
