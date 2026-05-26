import { create } from 'zustand';
import { CursorState, Project } from '@/types';

interface AppState {
  // Cursor State
  cursor: CursorState;
  setCursor: (cursor: Partial<CursorState>) => void;
  
  // Navigation State
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  
  // Booking Modal State
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (isOpen: boolean) => void;
  
  // Portfolio Filter State
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  
  // Selected Project State
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  
  // Loading State
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  
  // Auth State
  isAuthenticated: boolean;
  user: any | null;
  setAuth: (isAuthenticated: boolean, user: any | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Cursor
  cursor: {
    x: 0,
    y: 0,
    isHovering: false,
    text: undefined,
  },
  setCursor: (cursor) =>
    set((state) => ({
      cursor: { ...state.cursor, ...cursor },
    })),

  // Navigation
  isMenuOpen: false,
  setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),

  // Booking Modal
  isBookingModalOpen: false,
  setIsBookingModalOpen: (isOpen) => set({ isBookingModalOpen: isOpen }),

  // Portfolio Filter
  activeCategory: 'all',
  setActiveCategory: (category) => set({ activeCategory: category }),

  // Selected Project
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

  // Loading
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // Auth
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null });
  },
}));
