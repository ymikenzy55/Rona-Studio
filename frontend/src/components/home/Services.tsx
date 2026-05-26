import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, Video, Heart, Briefcase, Sparkles, Users, ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';

const iconMap: Record<string, any> = {
  Heart,
  Video,
  Briefcase,
  Sparkles,
  Camera,
  Users,
};

const defaultServiceImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop',
];

export const Services = () => {
  const { content } = useSiteContent();
  const servicesContent = content.services || {};
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  // Get service images from content or use defaults
  const serviceImages = servicesContent.serviceImages || defaultServiceImages;
  
  const services = (servicesContent.services || []).map((service: any, index: number) => ({
    ...service,
    icon: iconMap[Object.keys(iconMap)[index % Object.keys(iconMap).length]],
    image: service.image || serviceImages[index % serviceImages.length],
  }));

  return (
    <section id="services" ref={sectionRef} className="section-padding bg-gradient-to-b from-white via-primary-gray/30 to-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <motion.div
        style={{ y }}
        className="absolute top-40 right-0 w-[500px] h-[500px] bg-primary-yellow/5 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]) }}
        className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-primary-yellow/5 rounded-full blur-3xl"
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mb-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 bg-primary-yellow/10 rounded-full 
                           text-primary-yellow text-sm font-medium tracking-wider">
              {servicesContent.badge || 'WHAT WE OFFER'}
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary-dark 
                       leading-[1.1] mb-8"
          >
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="block will-change-transform"
            >
              {servicesContent.title?.split(' For ')[0] || 'Extraordinary Services'}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="block text-primary-yellow will-change-transform"
            >
              {servicesContent.title?.includes(' For ') ? 'For ' + servicesContent.title.split(' For ')[1] : 'For Every Occasion'}
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-gray-700 leading-relaxed font-medium"
          >
            {servicesContent.description || 'We offer a comprehensive range of photography and videography services tailored to your unique needs and vision.'}
          </motion.p>
        </div>

        {/* Services Grid - Polished Alternating Zigzag Layout */}
        <div className="space-y-24">
          {services.map((service, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="group will-change-transform"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  !isEven ? 'lg:flex-row-reverse' : ''
                }`}>
                  
                  {/* Image Section - Alternates sides */}
                  <motion.div
                    className={`relative aspect-[4/3] rounded-[2rem] overflow-hidden 
                              border-4 border-white shadow-2xl
                              group-hover:shadow-[0_25px_60px_-15px_rgba(250,204,21,0.4)]
                              transition-all duration-700 ${
                      !isEven ? 'lg:order-2' : ''
                    }`}
                    whileHover={{ scale: 1.02, y: -8 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <motion.img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8 }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/20 via-transparent to-primary-yellow/10" />
                    
                    {/* Number Badge - Floating with glow */}
                    <motion.div
                      className="absolute top-8 right-8 w-24 h-24 rounded-2xl bg-primary-yellow 
                               flex items-center justify-center shadow-[0_10px_40px_rgba(250,204,21,0.6)]
                               border-4 border-white"
                      whileHover={{ rotate: 360, scale: 1.15 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      <span className="text-4xl font-display font-bold text-primary-dark">
                        {service.number}
                      </span>
                    </motion.div>

                    {/* Decorative corner accent */}
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-yellow/20 
                                  rounded-tr-full opacity-60" />
                  </motion.div>

                  {/* Content Section - Alternates sides */}
                  <div className={`${!isEven ? 'lg:order-1' : ''} space-y-6`}>
                    {/* Icon with enhanced styling */}
                    <motion.div
                      className="inline-flex w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-yellow/20 to-primary-yellow/5
                               items-center justify-center mb-2
                               group-hover:from-primary-yellow group-hover:to-primary-yellow 
                               transition-all duration-500 shadow-lg group-hover:shadow-xl
                               border-2 border-primary-yellow/20 group-hover:border-primary-yellow"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <service.icon
                        size={40}
                        strokeWidth={2}
                        className="text-primary-yellow group-hover:text-white transition-colors duration-500"
                      />
                    </motion.div>

                    {/* Title with better typography */}
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-dark 
                                 leading-[1.1] group-hover:text-primary-yellow transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    {/* Description with better readability */}
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">
                      {service.description}
                    </p>

                    {/* Enhanced Accent Line with dot */}
                    <div className="flex items-center gap-3 pt-4">
                      <motion.div
                        className="h-1.5 bg-gradient-to-r from-primary-yellow to-primary-yellow/50 
                                 rounded-full will-change-transform shadow-md"
                        initial={{ width: 0 }}
                        whileInView={{ width: '140px' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="w-3 h-3 rounded-full bg-primary-yellow shadow-lg"
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 text-center"
        >
          <p className="text-xl text-gray-600 mb-8 font-medium">
            {servicesContent.ctaText || 'Can\'t find what you\'re looking for?'}
          </p>
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-3 px-12 py-6 bg-primary-dark text-white 
                       font-bold text-lg rounded-full hover:bg-primary-yellow hover:text-primary-dark
                       transition-all duration-500 shadow-xl hover:shadow-2xl"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            {servicesContent.ctaButton || 'Let\'s Talk About Your Project'}
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
