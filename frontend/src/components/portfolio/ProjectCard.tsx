import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useCustomCursor } from '@/hooks/useCustomCursor';
import { getOptimizedImageUrl } from '@/utils/helpers';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export const ProjectCard = ({ project, onClick, index }: ProjectCardProps) => {
  const { setHovering } = useCustomCursor();
  const hasVideo = project.videos && project.videos.length > 0;

  const imageUrl: string =
    (project as any).coverImage?.url ??
    (typeof (project as any).images?.[0] === 'string'
      ? (project as any).images[0]
      : (project as any).images?.[0]?.url) ??
    '';

  const categoryList: string[] =
    Array.isArray((project as any).categories) && (project as any).categories.length > 0
      ? (project as any).categories
      : (project as any).category
      ? [(project as any).category]
      : [];

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[4/5]"
      onClick={onClick}
      onMouseEnter={() => setHovering(true, hasVideo ? 'Play Reel' : 'View Project')}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image */}
      <motion.div
        className="absolute inset-0"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.1 },
        }}
        transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
      >
        <img
          src={imageUrl ? getOptimizedImageUrl(imageUrl, { width: 800, quality: 85 }) : ''}
          alt={project.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Yellow Overlay */}
      <motion.div
        className="absolute inset-0 bg-primary-yellow"
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 0.2 },
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Content Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                   flex flex-col justify-end p-6"
        variants={{
          rest: { opacity: 0, y: 20 },
          hover: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Video Icon */}
        {hasVideo && (
          <motion.div
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm
                       flex items-center justify-center"
            variants={{
              rest: { scale: 0, opacity: 0 },
              hover: { scale: 1, opacity: 1 },
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Play size={20} className="text-white fill-white ml-1" />
          </motion.div>
        )}

        {/* Category Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categoryList.slice(0, 2).map((category) => (
            <span
              key={category}
              className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs 
                         text-white font-medium uppercase tracking-wider"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-display font-bold text-white mb-2">
          {project.title}
        </h3>

        {/* Client */}
        {project.client && (
          <p className="text-white/80 text-sm">
            {project.client}
          </p>
        )}
      </motion.div>

      {/* Lift Effect Shadow */}
      <motion.div
        className="absolute -inset-4 bg-black/10 rounded-2xl -z-10 blur-xl"
        variants={{
          rest: { opacity: 0, y: 0 },
          hover: { opacity: 1, y: 8 },
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};
