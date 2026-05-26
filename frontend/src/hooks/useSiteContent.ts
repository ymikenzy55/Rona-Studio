import { useQuery } from '@tanstack/react-query';
import { siteContentApi } from '@/services/api';

export const useSiteContent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['siteContent'],
    queryFn: async () => {
      const response = await siteContentApi.getAll();
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds - faster updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return {
    content: data || {},
    isLoading,
    error,
  };
};
