import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import Lenis from 'lenis';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from '@/components/common/Navbar';
import { CustomCursor } from '@/components/common/CustomCursor';
import { Preloader } from '@/components/common/Preloader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { BookingModal } from '@/components/booking/BookingModal';
import { Home } from '@/pages/Home';
import { useStore } from '@/store/useStore';
import { socketService } from '@/services/socket';
import toast from 'react-hot-toast';

// Lazy load admin pages
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

// Create query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error: any) => {
        const errorMessage = error?.message || '';
        const errorCode = error?.code || '';
        
        if (errorMessage.includes('Network Error') || errorCode === 'ERR_NETWORK') {
          toast.error('Network error. Please check your internet connection and try again.', {
            duration: 5000,
            id: 'network-error',
          });
        } else if (error?.response?.status === 500) {
          toast.error('Server error. Please try again later.', {
            duration: 5000,
          });
        } else if (error?.response?.status === 404) {
          toast.error('Resource not found.', {
            duration: 4000,
          });
        }
      },
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-primary-yellow border-t-transparent 
                    rounded-full animate-spin" />
  </div>
);

function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const [showPreloader, setShowPreloader] = useState(true);

  // Hide preloader after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2500); // Show preloader for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Initialize Lenis smooth scroll (only for non-admin pages)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {showPreloader && <Preloader />}
            <AppContent lenisRef={lenisRef} />
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

// Separate component to use useLocation
function AppContent({ lenisRef }: { lenisRef: React.MutableRefObject<Lenis | null> }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isMenuOpen, isBookingModalOpen } = useStore();
  const queryClient = useQueryClient();

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Connection restored!', {
        duration: 3000,
        id: 'online-status',
      });
      // Refetch all queries when back online
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      toast.error('No internet connection. Please check your network.', {
        duration: 0, // Keep showing until online
        id: 'offline-status',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Stop/start Lenis when modals open/close or on admin pages
  useEffect(() => {
    if (isAdminRoute) {
      // Completely destroy Lenis on admin pages
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      // Remove admin-page class and ensure body can scroll
      document.body.classList.add('admin-page');
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    } else {
      // Remove admin-page class on public pages
      document.body.classList.remove('admin-page');
      
      if (lenisRef.current) {
        if (isMenuOpen || isBookingModalOpen) {
          lenisRef.current.stop();
        } else {
          lenisRef.current.start();
        }
      }
    }
    
    return () => {
      if (isAdminRoute) {
        document.body.classList.remove('admin-page');
      }
    };
  }, [isMenuOpen, isBookingModalOpen, lenisRef, isAdminRoute]);

  // Connect user socket for live updates on public pages
  useEffect(() => {
    if (isAdminRoute) return;

    const socket = socketService.connect('user');

    socket.on('project-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-projects'] });
    });

    socket.on('content-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    });

    return () => {
      socket.off('project-updated');
      socket.off('content-updated');
    };
  }, [isAdminRoute, queryClient]);

  return (
    <div className="App">
      <CustomCursor />
      {!isAdminRoute && <Navbar />}
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Suspense>

      <BookingModal />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0A0F2C',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#FACC15',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
