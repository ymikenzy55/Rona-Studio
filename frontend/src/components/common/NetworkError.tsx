import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError = ({ onRetry, message }: NetworkErrorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6"
        >
          <WifiOff size={40} className="text-orange-600" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-primary-dark mb-3">
          Network Error
        </h2>
        <p className="text-gray-600 mb-6">
          {message || 'Unable to connect to the server. Please check your internet connection and try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-yellow text-primary-dark font-bold rounded-xl hover:bg-yellow-500 transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
};
