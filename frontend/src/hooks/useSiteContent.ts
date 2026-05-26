import { useQuery } from '@tanstack/react-query';
import { siteContentApi } from '@/services/api';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const useSiteContent = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['siteContent'],
    queryFn: async () => {
      const response = await siteContentApi.getAll();
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds - faster updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2, // Retry failed requests twice
  });

  // Show network error toast
  useEffect(() => {
    if (error) {
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_NETWORK')) {
        toast.error('Network error. Please check your internet connection.', {
          duration: 5000,
          id: 'network-error', // Prevent duplicate toasts
        });
      }
    }
  }, [error]);

  return {
    content: data || {},
    isLoading,
    error,
    refetch,
  };
};
