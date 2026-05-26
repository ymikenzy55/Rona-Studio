import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, Twitter, Dribbble, Mail, Phone } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSiteContent } from '@/hooks/useSiteContent';

const navLinks = [
  { name: 'Home', path: '/', number: '01', section: 'hero' },
  { name: 'Portfolio', path: '/#portfolio', number: '02', section: 'portfolio' },
  { name: 'Services', path: '/#services', number: '03', section: 'services' },
  { name: 'About', path: '/#about', number: '04', section: 'about' },
  { name: 'Contact', path: '/#contact', number: '05', section: 'contact' },
  { name: 'Admin', path: '/admin/login', number: '06', section: 'admin', isAdmin: true },
];

const socialLinks = [
  { icon: Dribbble, href: 'https://dribbble.com', label: 'Dribbble', color: 'hover:bg-pink-400' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-sky-500' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { isMenuOpen, setIsMenuOpen, setIsBookingModalOpen } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { content } = useSiteContent();
  
  // Get contact info from database
  const contactContent = content.contact || {};
  const contactInfo = contactContent.contactInfo || [];
  const phoneInfo = contactInfo.find((info: any) => info.type === 'phone') || { value: '+233 123 456 789', link: 'tel:+233123456789' };
  const emailInfo = contactInfo.find((info: any) => info.type === 'email') || { value: 'hello@ronastudio.com', link: 'mailto:hello@ronastudio.com' };
  
  // Get social links from database
  const socialLinksFromDB = (contactContent.socialLinks || []).map((social: any) => {
    const iconMap: Record<string, any> = {
      Instagram,
      Facebook,
      Twitter,
      Dribbble,
    };
    return {
      icon: iconMap[social.platform] || Instagram,
      href: social.url,
      label: social.platform,
      color: social.platform === 'Instagram' ? 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500' :
             social.platform === 'Facebook' ? 'hover:bg-blue-600' :
             social.platform === 'Twitter' ? 'hover:bg-sky-500' :
             'hover:bg-pink-400'
    };
  });
  
  const socialLinksToUse = socialLinksFromDB.length > 0 ? socialLinksFromDB : socialLinks;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ['hero', 'portfolio', 'services', 'about', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const element = document.getElementById(section === 'hero' ? '' : section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        } else if (section === 'hero' && window.scrollY < 100) {
          setActiveSection('hero');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location, setIsMenuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scrollbar-width');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scrollbar-width');
    };
  }, [isMenuOpen]);

  const handleNavClick = (path: string) => {
    if (path.includes('#')) {
      const [, hash] = path.split('#');
      if (location.pathname === '/') {
        setTimeout(() => {
          const element = document.getElementById(hash);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else {
        window.location.href = path;
      }
    } else {
      // Handle regular routes (like /admin/login)
      navigate(path);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Top Bar with Logo and Hamburger */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary-dark backdrop-blur-md shadow-xl border-b border-primary-yellow/20 transition-all duration-500"
      >
        <div className="container-custom py-1 flex items-center justify-between">
          {/* Logo with Enhanced Animation */}
          <Link to="/" className="relative z-50 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img 
                src="/logo.png" 
                alt="Rona Studio" 
                className="h-16 sm:h-18 md:h-20 lg:h-24 w-auto object-contain transition-all duration-300
                           group-hover:brightness-125 group-hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]"
              />
              {/* Animated Underline */}
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-primary-yellow"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.4 }}
              />
              {/* Decorative Dot */}
              <motion.div
                className="absolute -top-1 -right-2 w-2 h-2 bg-primary-yellow rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>

          {/* Desktop Admin Link - Hidden on mobile */}
          <Link 
            to="/admin/login" 
            className="hidden lg:flex items-center gap-2 z-40 px-4 py-2 rounded-full 
                       bg-primary-yellow/10 hover:bg-primary-yellow border border-primary-yellow/30 
                       hover:border-primary-yellow transition-all duration-300 group"
            title="Admin Access Only"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-primary-yellow group-hover:text-primary-dark transition-colors"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm text-primary-yellow group-hover:text-primary-dark font-medium transition-colors">
              Admin
            </span>
          </Link>

          {/* Extraordinary Hamburger Button with Pulse Effect */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
                       bg-primary-yellow hover:bg-white group transition-all duration-500
                       shadow-lg hover:shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {/* Pulse Ring Animation */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary-yellow"
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [0.5, 0, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex flex-col justify-center items-center">
              {/* Top Line */}
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="absolute w-4 sm:w-5 h-0.5 bg-primary-dark group-hover:bg-primary-dark 
                           transition-colors duration-300"
              />
              {/* Middle Line */}
              <motion.span
                animate={isMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute w-4 sm:w-5 h-0.5 bg-primary-dark group-hover:bg-primary-dark 
                           transition-colors duration-300"
              />
              {/* Bottom Line */}
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                transition={{ duration: 0.3 }}
                className="absolute w-4 sm:w-5 h-0.5 bg-primary-dark group-hover:bg-primary-dark 
                           transition-colors duration-300"
              />
            </div>
          </motion.button>
        </div>
      </motion.nav>

      {/* Extraordinary Fullscreen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Background Overlay with Split Animation and Gradient */}
            <motion.div
              initial={{ clipPath: 'circle(0% at 95% 5%)' }}
              animate={{ clipPath: 'circle(150% at 95% 5%)' }}
              exit={{ clipPath: 'circle(0% at 95% 5%)' }}
              transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
              className="fixed inset-0 bg-gradient-to-br from-primary-dark via-primary-dark to-primary-dark/95 z-40"
              onClick={() => setIsMenuOpen(false)}
            >
              {/* Animated Background Elements */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.03, 0.05, 0.03]
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-20 right-20 w-96 h-96 bg-primary-yellow rounded-full blur-3xl pointer-events-none"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0],
                  opacity: [0.03, 0.05, 0.03]
                }}
                transition={{ duration: 25, repeat: Infinity }}
                className="absolute bottom-20 left-20 w-96 h-96 bg-primary-yellow rounded-full blur-3xl pointer-events-none"
              />
            </motion.div>

            {/* Menu Content - Scrollable */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="fixed inset-0 z-40 overflow-y-auto pointer-events-none"
              data-lenis-prevent
            >
              <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-24 sm:py-28 md:py-32 pointer-events-none">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 my-8 pointer-events-auto"
                     onClick={(e) => e.stopPropagation()}>
                  
                  {/* Left Side - Navigation Links */}
                  <div className="flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="mb-6 md:mb-8"
                    >
                      <span className="text-primary-yellow text-xs sm:text-sm tracking-[0.3em] font-medium">
                        NAVIGATION
                      </span>
                    </motion.div>

                    <nav className="space-y-1 sm:space-y-2">
                      {navLinks.map((link, index) => {
                        const isActive = activeSection === link.section;
                        const isAdminLink = link.isAdmin;
                        
                        return (
                          <motion.div key={link.path}>
                            <motion.button
                              onClick={() => handleNavClick(link.path)}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              transition={{ 
                                duration: 0.5, 
                                delay: 0.4 + index * 0.1,
                                ease: [0.6, 0.05, 0.01, 0.9]
                              }}
                              className="group flex items-center gap-3 sm:gap-4 md:gap-6 py-2 sm:py-3 md:py-4 w-full text-left
                                         hover:translate-x-2 sm:hover:translate-x-4 transition-transform duration-500 relative"
                            >
                              {/* Active Indicator */}
                              {isActive && !isAdminLink && (
                                <motion.div
                                  layoutId="activeSection"
                                  className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-1 h-8 sm:h-10 md:h-12 bg-primary-yellow rounded-full"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}

                              {/* Admin Icon */}
                              {isAdminLink && (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="text-primary-yellow/50 group-hover:text-primary-yellow transition-colors sm:w-6 sm:h-6"
                                >
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              )}

                              {/* Number */}
                              {!isAdminLink && (
                                <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                                  isActive 
                                    ? 'text-primary-yellow' 
                                    : 'text-primary-yellow/50 group-hover:text-primary-yellow'
                                }`}>
                                  {link.number}
                                </span>
                              )}
                              
                              {/* Link Text */}
                              <span className={`${isAdminLink ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'} font-display font-bold transition-colors duration-300 ${
                                isActive && !isAdminLink
                                  ? 'text-primary-yellow'
                                  : 'text-white group-hover:text-primary-yellow'
                              }`}>
                                {link.name}
                              </span>

                              {/* Animated Line */}
                              {!isAdminLink && (
                                <motion.div
                                  className="hidden sm:block h-0.5 bg-primary-yellow flex-1"
                                  initial={{ scaleX: isActive ? 1 : 0 }}
                                  whileHover={{ scaleX: 1 }}
                                  transition={{ duration: 0.5 }}
                                  style={{ originX: 0 }}
                                />
                              )}
                            </motion.button>
                            
                            {/* Admin Access Only Label */}
                            {isAdminLink && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 + 0.2 }}
                                className="text-xs text-primary-yellow/40 ml-8 sm:ml-10 -mt-2"
                              >
                                Admin Access Only
                              </motion.p>
                            )}
                          </motion.div>
                        );
                      })}
                    </nav>

                    {/* CTA Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsBookingModalOpen(true);
                      }}
                      className="mt-8 sm:mt-10 md:mt-12 px-8 sm:px-10 md:px-12 py-4 sm:py-5 bg-primary-yellow text-primary-dark 
                               font-bold text-base sm:text-lg rounded-full hover:bg-white 
                               transition-all duration-500 hover:scale-105 hover:shadow-2xl
                               inline-flex items-center justify-center gap-3 w-full sm:w-fit"
                      whileHover={{ x: 10 }}
                    >
                      Book an Appointment
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.button>
                  </div>

                  {/* Right Side - Contact & Social */}
                  <div className="flex flex-col justify-between space-y-8 lg:space-y-0">
                    
                    {/* Contact Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="space-y-6 sm:space-y-8"
                    >
                      <div>
                        <span className="text-primary-yellow text-xs sm:text-sm tracking-[0.3em] font-medium mb-4 sm:mb-6 block">
                          GET IN TOUCH
                        </span>
                        
                        <div className="space-y-4 sm:space-y-6">
                          <motion.a
                            href={emailInfo.link}
                            className="flex items-center gap-3 sm:gap-4 text-white/80 hover:text-primary-yellow 
                                     transition-colors duration-300 group"
                            whileHover={{ x: 10 }}
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center 
                                          justify-center group-hover:bg-primary-yellow transition-all duration-300">
                              <Mail size={18} className="sm:w-5 sm:h-5 group-hover:text-primary-dark transition-colors" />
                            </div>
                            <span className="text-sm sm:text-base md:text-lg break-all">{emailInfo.value}</span>
                          </motion.a>

                          <motion.a
                            href={phoneInfo.link}
                            className="flex items-center gap-3 sm:gap-4 text-white/80 hover:text-primary-yellow 
                                     transition-colors duration-300 group"
                            whileHover={{ x: 10 }}
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center 
                                          justify-center group-hover:bg-primary-yellow transition-all duration-300">
                              <Phone size={18} className="sm:w-5 sm:h-5 group-hover:text-primary-dark transition-colors" />
                            </div>
                            <span className="text-sm sm:text-base md:text-lg">{phoneInfo.value}</span>
                          </motion.a>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <span className="text-primary-yellow text-xs sm:text-sm tracking-[0.3em] font-medium mb-3 sm:mb-4 block">
                          STUDIO LOCATION
                        </span>
                        <p className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed">
                          123 Studio Street<br />
                          Creative District<br />
                          Accra, Ghana
                        </p>
                      </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="mt-8 sm:mt-10 lg:mt-12"
                    >
                      <span className="text-primary-yellow text-xs sm:text-sm tracking-[0.3em] font-medium mb-4 sm:mb-6 block">
                        FOLLOW US
                      </span>
                      <div className="flex gap-3 sm:gap-4">
                        {socialLinksToUse.map((social, index) => (
                          <motion.a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 0.8 + index * 0.1,
                              type: 'spring',
                              stiffness: 200
                            }}
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center
                                     text-white ${social.color} hover:text-white
                                     transition-all duration-500 backdrop-blur-sm border border-white/20
                                     hover:border-transparent hover:shadow-lg`}
                          >
                            <social.icon size={18} className="sm:w-5 sm:h-5" />
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>

                    {/* Decorative Element */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-px bg-gradient-to-r from-primary-yellow to-transparent mt-8 sm:mt-10 lg:mt-12"
                      style={{ originX: 0 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
