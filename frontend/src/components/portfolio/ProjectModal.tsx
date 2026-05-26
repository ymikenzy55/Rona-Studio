import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, User } from 'lucide-react';
import { modalBackdrop, modalContent } from '@/animations/variants';
import { getOptimizedImageUrl, formatDate, lockScroll, unlockScroll } from '@/utils/helpers';
import type { Project } from '@/types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (project) {
      lockScroll();
      setCurrentIndex(0);
    } else {
      unlockScroll();
    }

    return () => unlockScroll();
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;

      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, currentIndex]);

  if (!project) return null;

  // Normalise images: backend returns string[] or MediaAsset[]
  const normaliseMedia = (items: any[]): { url: string; type: 'image' | 'video'; thumbnail?: string }[] =>
    items.map((item) =>
      typeof item === 'string'
        ? { url: item, type: 'image' as const }
        : { url: item.url, type: item.type || 'image', thumbnail: item.thumbnail }
    );

  const normalImages = normaliseMedia((project as any).images || []);
  const normalVideos = normaliseMedia((project as any).videos || []);
  const allMedia = [...normalImages, ...normalVideos];

  const categoryList: string[] =
    Array.isArray((project as any).categories) && (project as any).categories.length > 0
      ? (project as any).categories
      : (project as any).category
      ? [(project as any).category]
      : [];
  const totalMedia = allMedia.length || 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalMedia);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const currentMedia = allMedia[currentIndex];

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          variants={modalBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/95 z-[100] overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            className="min-h-screen p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="fixed top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 
                         backdrop-blur-sm flex items-center justify-center text-white 
                         hover:bg-white/20 transition-colors duration-300"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>

            {/* Progress Indicator */}
            <div className="fixed top-6 left-6 z-10 text-white font-medium">
              {currentIndex + 1} / {totalMedia}
            </div>

            <div className="max-w-7xl mx-auto">
              {/* Gallery */}
              <div className="relative mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4 }}
                    className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900"
                  >
                    {currentMedia?.type === 'video' ? (
                      <video
                        src={currentMedia.url}
                        controls
                        autoPlay
                        className="w-full h-full"
                      />
                    ) : currentMedia?.url ? (
                      <img
                        src={getOptimizedImageUrl(currentMedia.url, { width: 1920, quality: 90 })}
                        alt={`${project.title} - ${currentIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {totalMedia > 1 && (
                  <>
                    <motion.button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full 
                                 bg-white/10 backdrop-blur-sm flex items-center justify-center 
                                 text-white hover:bg-white/20 transition-colors duration-300"
                      whileHover={{ scale: 1.1, x: -4 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft size={24} />
                    </motion.button>

                    <motion.button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full 
                                 bg-white/10 backdrop-blur-sm flex items-center justify-center 
                                 text-white hover:bg-white/20 transition-colors duration-300"
                      whileHover={{ scale: 1.1, x: 4 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight size={24} />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Project Info */}
              <div className="bg-white rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categoryList.map((category) => (
                        <span
                          key={category}
                          className="px-4 py-2 bg-primary-yellow/10 text-primary-dark 
                                     rounded-full text-sm font-medium uppercase tracking-wider"
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    <h2 className="heading-md mb-4">{project.title}</h2>
                    <p className="text-body-lg mb-6">{project.description}</p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    {project.client && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <User size={20} className="text-primary-yellow" />
                        <div>
                          <p className="text-sm text-gray-500">Client</p>
                          <p className="font-medium">{project.client}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={20} className="text-primary-yellow" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(project.date)}</p>
                      </div>
                    </div>

                    {project.location && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin size={20} className="text-primary-yellow" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{project.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Sections */}
                {(project as any).sections?.filter((s: any) => s.mediaUrl).length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-display font-bold text-primary-dark mb-4">Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {(project as any).sections
                        .filter((s: any) => s.mediaUrl)
                        .map((sec: any, i: number) => (
                          <div key={i} className="rounded-xl overflow-hidden">
                            {sec.mediaType === 'video' ? (
                              <video
                                src={sec.mediaUrl}
                                controls
                                className="w-full aspect-video object-cover"
                              />
                            ) : (
                              <img
                                src={sec.mediaUrl}
                                alt={sec.title || `Section ${i + 1}`}
                                className="w-full aspect-video object-cover"
                              />
                            )}
                            {(sec.title || sec.description) && (
                              <div className="p-3">
                                {sec.title && <p className="font-semibold text-primary-dark text-sm">{sec.title}</p>}
                                {sec.description && <p className="text-gray-500 text-xs mt-1">{sec.description}</p>}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Thumbnail Gallery */}
                {totalMedia > 1 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {allMedia.map((media, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden ${
                            index === currentIndex
                              ? 'ring-4 ring-primary-yellow'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={getOptimizedImageUrl(
                              (media as any).type === 'video' ? (media as any).thumbnail || media.url : media.url,
                              { width: 200, quality: 70 }
                            )}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
