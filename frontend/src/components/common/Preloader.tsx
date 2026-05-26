import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Preloader = () => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Auto-hide after 2.5 seconds
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isComplete) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="fixed inset-0 z-[10000] bg-primary-dark flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Animated Background Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-yellow rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.15, 0.1],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-yellow rounded-full blur-[120px]"
        />

        {/* Logo with Elegant Animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0
          }}
          transition={{ 
            duration: 1, 
            ease: [0.6, 0.05, 0.01, 0.9]
          }}
          className="relative z-10"
        >
          {/* Glow Effect Behind Logo */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-primary-yellow/30 blur-3xl rounded-full"
          />
          
          {/* Logo */}
          <motion.img 
            src="/logo.png" 
            alt="Rona Studio" 
            className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 w-auto object-contain relative z-10"
            animate={{
              filter: [
                'brightness(1) drop-shadow(0 0 20px rgba(250, 204, 21, 0.3))',
                'brightness(1.1) drop-shadow(0 0 30px rgba(250, 204, 21, 0.5))',
                'brightness(1) drop-shadow(0 0 20px rgba(250, 204, 21, 0.3))'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mt-12 relative z-10"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut'
              }}
              className="w-2 h-2 rounded-full bg-primary-yellow"
            />
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8 text-center relative z-10"
        >
          <p className="text-xs sm:text-sm tracking-[0.3em] text-primary-yellow/60 uppercase font-medium">
            Capturing Timeless Moments
          </p>
        </motion.div>

        {/* Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] 
                         border border-primary-yellow/10 rounded-full" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] 
                         border border-primary-yellow/5 rounded-full" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
