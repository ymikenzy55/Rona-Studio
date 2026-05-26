import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, Clock, Instagram, Facebook, Twitter, Dribbble } from 'lucide-react';
import { contactApi } from '@/services/api';
import { useSiteContent } from '@/hooks/useSiteContent';
import type { ContactFormData } from '@/types';

const iconMap: Record<string, any> = {
  phone: Phone,
  whatsapp: Phone,
  email: Mail,
  location: MapPin,
  hours: Clock,
};

const socialIconMap: Record<string, any> = {
  Instagram,
  Facebook,
  Twitter,
  Dribbble,
};

export const Contact = () => {
  const { content } = useSiteContent();
  const contactContent = content.contact || {};
  
  const contactInfo = contactContent.contactInfo || [
    {
      type: 'phone',
      label: 'Phone',
      value: '+233 123 456 789',
      link: 'tel:+233123456789'
    },
    {
      type: 'email',
      label: 'Email',
      value: 'hello@ronastudio.com',
      link: 'mailto:hello@ronastudio.com'
    },
    {
      type: 'location',
      label: 'Location',
      value: '123 Studio Street, Accra',
      link: 'https://maps.google.com'
    },
    {
      type: 'hours',
      label: 'Hours',
      value: 'Mon-Fri: 9AM-6PM',
      link: null
    },
  ];
  
  const socialLinks = (contactContent.socialLinks || [
    { platform: 'Instagram', url: 'https://instagram.com' },
    { platform: 'Facebook', url: 'https://facebook.com' },
    { platform: 'Twitter', url: 'https://twitter.com' },
    { platform: 'Dribbble', url: 'https://dribbble.com' },
  ]).map((social: any) => ({
    icon: socialIconMap[social.platform] || Instagram,
    href: social.url,
    label: social.platform,
  }));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      await contactApi.create(data);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error: any) {
      if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
      }
    }
  };

  return (
    <>
      <section id="contact" className="section-padding bg-primary-gray relative overflow-hidden">
        <div className="container-custom">
          
          {/* Header - Converge from top and bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              className="inline-block px-6 py-2 bg-primary-yellow/10 rounded-full 
                         text-primary-yellow text-sm font-medium tracking-wider mb-6 will-change-transform"
            >
              {contactContent.badge || 'GET IN TOUCH'}
            </motion.span>
            
            <motion.h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary-dark 
                         leading-[1.1] mb-8">
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="block will-change-transform"
              >
                {contactContent.title?.split(' Together')[0] || 'Let\'s Create Something Amazing'}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="block text-primary-yellow will-change-transform"
              >
                {contactContent.title?.includes('Together') ? 'Together' : ''}
              </motion.span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-700 leading-relaxed"
            >
              {contactContent.description || 'Ready to start your project? We\'d love to hear from you.'}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
            
            {/* Contact Form - Comes FIRST on mobile, SECOND on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 order-1 lg:order-2 will-change-transform"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-primary-dark mb-3">
                        Name *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white
                                   focus:border-primary-yellow focus:outline-none transition-all duration-300
                                   text-primary-dark placeholder:text-gray-400 font-medium"
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-primary-dark mb-3">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email',
                          },
                        })}
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white
                                   focus:border-primary-yellow focus:outline-none transition-all duration-300
                                   text-primary-dark placeholder:text-gray-400 font-medium"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary-dark mb-3">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^\d{10}$/,
                          message: 'Phone number must be exactly 10 digits',
                        },
                      })}
                      onKeyDown={(e) => {
                        if (!/[\d\b]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      maxLength={10}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white
                                 focus:border-primary-yellow focus:outline-none transition-all duration-300
                                 text-primary-dark placeholder:text-gray-400 font-medium"
                      placeholder="0201234567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-2">{errors.phone.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Enter 10 digits only (numbers only)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary-dark mb-3">
                      Subject
                    </label>
                    <input
                      type="text"
                      {...register('subject')}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white
                                 focus:border-primary-yellow focus:outline-none transition-all duration-300
                                 text-primary-dark placeholder:text-gray-400 font-medium"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary-dark mb-3">
                      Message *
                    </label>
                    <textarea
                      {...register('message', { required: 'Message is required' })}
                      rows={6}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white
                                 focus:border-primary-yellow focus:outline-none transition-all duration-300
                                 text-primary-dark placeholder:text-gray-400 resize-none font-medium"
                      placeholder="Tell us about your project..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-10 py-5 bg-primary-yellow text-primary-dark 
                               font-bold text-lg rounded-xl hover:bg-primary-dark hover:text-white
                               transition-all duration-500 flex items-center justify-center gap-3
                               disabled:opacity-50 shadow-lg hover:shadow-2xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-primary-dark border-t-transparent rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={20} />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info Cards - Comes SECOND on mobile, FIRST on desktop */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1 order-2 lg:order-1 space-y-6 will-change-transform"
            >
              {contactInfo.map((item, index) => {
                const IconComponent = iconMap[item.type] || Phone;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300
                             border-2 border-gray-200 hover:border-primary-yellow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-yellow/10 flex items-center 
                                    justify-center flex-shrink-0">
                        <IconComponent size={24} className="text-primary-yellow" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                        {item.link ? (
                          <a href={item.link} className="font-bold text-primary-dark hover:text-primary-yellow 
                                                        transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-bold text-primary-dark">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Social Links */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
                <p className="font-bold text-primary-dark mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-xl bg-primary-gray flex items-center justify-center
                               text-primary-dark hover:bg-primary-yellow hover:text-white
                               transition-all duration-300"
                    >
                      <social.icon size={20} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Map Section - Fade and scale in */}
      <section className="relative h-[500px] md:h-[600px] w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="w-full h-full will-change-transform"
        >
          <iframe
            src={contactContent.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8267619758814!2d-0.1969!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnMTMuMyJOIDDCsDExJzQ4LjgiVw!5e0!3m2!1sen!2sgh!4v1234567890"}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale hover:grayscale-0 transition-all duration-500"
          />
        </motion.div>
        
        {/* Map Overlay Info - Slide from bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-8 left-8 bg-white rounded-2xl p-6 shadow-2xl max-w-sm
                   border-2 border-primary-yellow will-change-transform"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-yellow flex items-center justify-center">
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-primary-dark mb-1">Visit Our Studio</p>
              <p className="text-gray-700 text-sm">
                {(() => {
                  const locationInfo = contactInfo.find(info => info.type === 'location');
                  return locationInfo?.value || '123 Studio Street, Accra, Ghana';
                })()}
              </p>
              {contactContent.mapUrl && (
                <a 
                  href={contactContent.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-yellow hover:text-primary-dark font-semibold text-sm mt-2 transition-colors"
                >
                  Get Directions →
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};
