import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Camera, Heart, Target, Zap } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

const iconMap: Record<string, any> = {
  Camera,
  Users,
  Award,
  Heart,
  Target,
  Zap,
};

export const About = () => {
  const { content } = useSiteContent();
  const aboutContent = content.about || {};
  
  const stats = aboutContent.stats || [
    { value: '500+', label: 'Projects' },
    { value: '300+', label: 'Clients' },
    { value: '15+', label: 'Awards' },
    { value: '10+', label: 'Years' },
  ];
  
  const values = aboutContent.values || [
    {
      title: 'Precision',
      description: 'Every shot is carefully composed with technical excellence'
    },
    {
      title: 'Passion',
      description: 'We love what we do and it shows in every frame'
    },
    {
      title: 'Innovation',
      description: 'Cutting-edge techniques meet timeless artistry'
    },
  ];
  
  const statsIcons = [Camera, Users, Award, Heart];
  const valuesIcons = [Target, Heart, Zap];
  return (
    <section id="about" className="section-padding bg-white relative overflow-hidden">
      <div className="container-custom">
        
        {/* Header - Converge from sides */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="inline-block px-6 py-2 bg-primary-yellow/10 rounded-full 
                       text-primary-yellow text-sm font-medium tracking-wider mb-6 will-change-transform"
          >
            {aboutContent.badge || 'ABOUT US'}
          </motion.span>
          
          <motion.h2 
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary-dark 
                       leading-[1.1] mb-8"
          >
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="block will-change-transform"
            >
              {aboutContent.title?.split(' Since ')[0] || 'Crafting Visual Stories'}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="block text-primary-yellow will-change-transform"
            >
              {aboutContent.title?.includes('Since') ? 'Since ' + aboutContent.title.split(' Since ')[1] : 'Since 2014'}
            </motion.span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-700 leading-relaxed"
          >
            {aboutContent.description || 'We are a team of passionate photographers and videographers dedicated to capturing life\'s most precious moments with elegance and artistry.'}
          </motion.p>
        </motion.div>

        {/* Stats Grid - Converge from corners */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat, index) => {
            const positions = [
              { x: -30, y: -30 }, // Top-left
              { x: 30, y: -30 },  // Top-right
              { x: -30, y: 30 },  // Bottom-left
              { x: 30, y: 30 }    // Bottom-right
            ];
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: positions[index].x, y: positions[index].y }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-primary-gray rounded-2xl p-8 text-center border-2 border-gray-200 
                         hover:border-primary-yellow transition-all duration-300 shadow-md hover:shadow-xl will-change-transform"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-yellow/10 
                              flex items-center justify-center">
                  {React.createElement(statsIcons[index], { size: 32, className: 'text-primary-yellow' })}
                </div>
                <p className="text-4xl font-display font-bold text-primary-dark mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-700 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Content Grid - Converge from left and right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          
          {/* Left: Story - Slide from left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="will-change-transform"
          >
            <h3 className="text-3xl font-display font-bold text-primary-dark mb-6">
              {aboutContent.story?.title || 'Our Story'}
            </h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              {(aboutContent.story?.paragraphs || [
                'With over a decade of experience, we\'ve had the privilege of documenting countless weddings, corporate events, fashion shoots, and special occasions.',
                'Our approach combines technical excellence with creative vision to deliver stunning visual stories that you\'ll treasure forever.',
                'Every project is unique, and we take the time to understand your vision, ensuring that every shot reflects your personality and style.'
              ]).map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Story Images */}
            {aboutContent.story?.images && aboutContent.story.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {aboutContent.story.images.map((image: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={image}
                      alt={`Story ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Values - Slide from right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="will-change-transform"
          >
            <h3 className="text-3xl font-display font-bold text-primary-dark mb-6">
              Our Values
            </h3>
            <div className="space-y-6">
              {values.map((value: any, index: number) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4 will-change-transform"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-yellow/10 flex items-center 
                                justify-center flex-shrink-0">
                    {React.createElement(valuesIcons[index], { size: 24, className: 'text-primary-yellow' })}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-dark mb-2">{value.title}</h4>
                    <p className="text-gray-700">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quote - Scale from center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center will-change-transform"
        >
          <div className="bg-primary-dark rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-yellow/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-yellow/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-2xl md:text-3xl font-display text-white mb-6 leading-relaxed">
                "{aboutContent.quote || 'We don\'t just take photos, we create timeless memories that tell your unique story.'}"
              </p>
              <p className="text-primary-yellow font-bold">— Rona Studio Team</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
