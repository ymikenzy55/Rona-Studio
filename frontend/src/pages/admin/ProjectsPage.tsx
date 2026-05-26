import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsApi } from '@/services/api';
import { ProjectModal } from '@/components/admin/ProjectModal';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: string | null; projectTitle: string }>({
    isOpen: false,
    projectId: null,
    projectTitle: '',
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      projectId: id,
      projectTitle: title,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.projectId) {
      deleteMutation.mutate(deleteConfirm.projectId);
      setDeleteConfirm({ isOpen: false, projectId: null, projectTitle: '' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {projects ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : ''}
        </p>
        <button
          type="button"
          onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-yellow text-primary-dark 
                   font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-sm text-sm touch-manipulation"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Eye size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-4">No projects yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-primary-yellow text-primary-dark font-bold rounded-xl hover:bg-yellow-500 transition-colors text-sm"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects?.map((project: any, i: number) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md 
                       transition-all border border-gray-100 group"
            >
              <div className="relative h-48 bg-gray-100">
                {project.images?.[0] ? (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye size={32} className="text-gray-300" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {project.featured && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-yellow text-primary-dark shadow-sm">
                      Featured
                    </span>
                  )}
                </div>
                {project.images?.length > 1 && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-semibold">
                    +{project.images.length - 1} more
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display font-bold text-primary-dark line-clamp-1 flex-1">
                    {project.title}
                  </h3>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-2">
                  {project.category}
                </span>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {project.description}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(`/`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                             bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                             transition-colors text-xs font-semibold touch-manipulation"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => { setEditingProject(project); setIsModalOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                             bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 
                             transition-colors text-xs font-semibold touch-manipulation"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id, project.title)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                             bg-red-50 text-red-600 rounded-xl hover:bg-red-100 
                             transition-colors text-xs font-semibold touch-manipulation"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: null, projectTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm.projectTitle}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
