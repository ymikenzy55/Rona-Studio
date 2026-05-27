import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';
import { useStore } from '@/store/useStore';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { staggerContainer, staggerItem } from '@/animations/variants';
import type { ProjectCategory } from '@/types';

const categories: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Wedding', value: 'Wedding' },
  { label: 'Corporate', value: 'Corporate' },
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Portrait', value: 'Portrait' },
  { label: 'Event', value: 'Event' },
  { label: 'Product', value: 'Product' },
];

export const PortfolioGrid = () => {
  const { activeCategory, setActiveCategory, selectedProject, setSelectedProject } = useStore();
  
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data.data || [];
    },
  });

  const filteredProjects = useMemo(() => {
    if (!projectsData) return [];
    if (activeCategory === 'all') return projectsData;
    return projectsData.filter((project) =>
      project.category === activeCategory
    );
  }, [projectsData, activeCategory]);

  return (
    <section id="portfolio" className="section-padding bg-white overflow-hidden">
      <div className="container-custom max-w-full px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12 lg:mb-16 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-3 md:mb-4 lg:mb-6"
          >
            <span className="inline-block px-4 py-2 md:px-6 md:py-2 bg-primary-yellow/10 rounded-full 
                           text-primary-yellow text-xs md:text-sm font-medium tracking-wider">
              OUR WORK
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-primary-dark 
                       leading-[1.1] mb-3 md:mb-4 lg:mb-6">
            Our Portfolio
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Explore our collection of stunning photography and videography work
          </p>
        </motion.div>

        {/* Category Filter - Mobile and Desktop Separated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 md:mb-12 lg:mb-16"
        >
          {/* Mobile Only: Horizontal Scroll */}
          <div className="block md:hidden overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
            <div className="flex gap-2.5 min-w-max">
              {categories.map((category) => (
                <button
                  key={`mobile-${category.value}`}
                  onClick={() => setActiveCategory(category.value)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 
                             shadow-md whitespace-nowrap text-sm touch-manipulation ${
                    activeCategory === category.value
                      ? 'bg-primary-yellow text-primary-dark shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 active:bg-gray-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Only: Flex Wrap */}
          <div className="hidden md:flex flex-wrap justify-center gap-3 lg:gap-4">
            {categories.map((category) => (
              <motion.button
                key={`desktop-${category.value}`}
                onClick={() => setActiveCategory(category.value)}
                className={`px-6 lg:px-8 py-3 lg:py-4 rounded-full font-semibold transition-all duration-300 
                           shadow-md hover:shadow-xl ${
                  activeCategory === category.value
                    ? 'bg-primary-yellow text-primary-dark scale-105 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-primary-gray border-2 border-gray-200 hover:border-primary-yellow/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Projects Grid - 2 columns on mobile, 3 on desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                variants={staggerItem}
                layout
              >
                <ProjectCard
                  project={project}
                  onClick={() => setSelectedProject(project)}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 md:py-20"
          >
            <div className="mb-4">
              <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg md:text-xl text-gray-500 mb-2">No projects found</p>
            <p className="text-sm md:text-base text-gray-400">Try selecting a different category</p>
          </motion.div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
