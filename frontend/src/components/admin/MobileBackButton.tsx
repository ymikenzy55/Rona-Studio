import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const MobileBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on dashboard home
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate(-1)}
      className="fixed bottom-24 left-4 z-50 lg:hidden p-3 bg-primary-yellow rounded-full 
               shadow-lg hover:shadow-xl transition-all active:scale-95"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={24} className="text-primary-dark" />
    </motion.button>
  );
};
