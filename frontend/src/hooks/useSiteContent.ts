import { useQuery } from '@tanstack/react-query';
import { siteContentApi } from '@/services/api';

export const useSiteContent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['siteContent'],
    queryFn: async () => {
      const response = await siteContentApi.getAll();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    content: data || {},
    isLoading,
    error,
  };
};
