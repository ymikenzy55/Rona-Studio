import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { textRevealContainer, textReveal, fadeInUp } from '@/animations/variants';
import { useMagneticButton } from '@/hooks/useMagneticButton';
import { useSiteContent } from '@/hooks/useSiteContent';

export const Hero = () => {
  const setIsBookingModalOpen = useStore((state) => state.setIsBookingModalOpen);
  const { content } = useSiteContent();
  const heroContent = content.hero || {};
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  const bookButton = useMagneticButton(0.3);
  const portfolioButton = useMagneticButton(0.3);

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden grain">
      {/* Background Image with Parallax */}
      <motion.div
        style={{ scale, y }}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroContent.backgroundImage || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=2787&auto=format&fit=crop'}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex items-center justify-center"
      >
        <div className="container-custom text-center">
          {/* Animated Heading - Converge from sides */}
          <motion.div className="mb-6 md:mb-8 overflow-hidden px-4">
            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-white mb-4 leading-tight">
              <motion.span 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-block will-change-transform"
              >
                {heroContent.title?.split(' ')[0] || 'Capturing'}
              </motion.span>{' '}
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block text-primary-yellow will-change-transform"
              >
                {heroContent.title?.split(' ')[1] || 'Timeless'}
              </motion.span>
              <br />
              <motion.span 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="inline-block will-change-transform"
              >
                {heroContent.title?.split(' ')[2] || 'Moments'}
              </motion.span>
            </motion.h1>
          </motion.div>

          {/* Subtitle - Fade from bottom */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 md:mb-12 max-w-2xl mx-auto font-medium
                       drop-shadow-lg px-4"
          >
            {heroContent.subtitle || 'Premium photography and videography services for your most precious memories'}
          </motion.p>

          {/* CTA Buttons - Converge from left and right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4"
          >
            <motion.button
              ref={bookButton.ref}
              onMouseMove={bookButton.handleMouseMove}
              onMouseLeave={bookButton.handleMouseLeave}
              onClick={() => setIsBookingModalOpen(true)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="btn-primary text-base md:text-lg px-8 md:px-10 py-4 md:py-5 will-change-transform w-full sm:w-auto"
              style={{
                transform: `translate(${bookButton.position.x}px, ${bookButton.position.y}px)`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {heroContent.buttonText || 'Book an Appointment'}
            </motion.button>

            <motion.button
              ref={portfolioButton.ref}
              onMouseMove={portfolioButton.handleMouseMove}
              onMouseLeave={portfolioButton.handleMouseLeave}
              onClick={scrollToPortfolio}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="btn-secondary text-base md:text-lg px-8 md:px-10 py-4 md:py-5 bg-white/20 backdrop-blur-md 
                         border-2 border-white text-white hover:bg-white hover:text-primary-dark
                         shadow-lg hover:shadow-2xl will-change-transform w-full sm:w-auto"
              style={{
                transform: `translate(${portfolioButton.position.x}px, ${portfolioButton.position.y}px)`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Portfolio
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          onClick={scrollToPortfolio}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white hover:text-primary-yellow 
                     transition-colors duration-300"
          aria-label="Scroll down"
        >
          <span className="text-xs md:text-sm font-medium tracking-wider">SCROLL</span>
          <ChevronDown size={20} className="md:w-6 md:h-6" />
        </motion.button>
      </motion.div>
    </section>
  );
};
