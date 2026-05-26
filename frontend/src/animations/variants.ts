import { Variants } from 'framer-motion';

// Fade Animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: { opacity: 0, y: 10 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Scale Animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: { opacity: 0, scale: 0.98 },
};

export const scaleUp: Variants = {
  initial: { scale: 1 },
  animate: { 
    scale: 1.03,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Slide Animations
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Stagger Container
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Text Reveal
export const textReveal: Variants = {
  initial: { 
    y: '100%',
    opacity: 0,
  },
  animate: { 
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export const textRevealContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

// Image Reveal
export const imageReveal: Variants = {
  initial: { 
    scale: 1.1,
    opacity: 0,
  },
  animate: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Modal Animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContent: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.98,
    y: 10,
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Menu Animations
export const menuContainer: Variants = {
  initial: { 
    clipPath: 'circle(0% at 100% 0%)',
  },
  animate: { 
    clipPath: 'circle(150% at 100% 0%)',
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: { 
    clipPath: 'circle(0% at 100% 0%)',
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

export const menuItem: Variants = {
  initial: { 
    opacity: 0, 
    x: 30,
  },
  animate: { 
    opacity: 1, 
    x: 0,
  },
  exit: { 
    opacity: 0, 
    x: 30,
  },
};

// Page Transitions
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    y: 10,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Hover Animations
export const hoverLift = {
  rest: { y: 0 },
  hover: { 
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export const hoverScale = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Magnetic Button
export const magneticButton = {
  rest: { x: 0, y: 0 },
  hover: { 
    x: 0, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};
