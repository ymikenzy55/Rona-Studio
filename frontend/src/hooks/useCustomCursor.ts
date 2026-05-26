import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export const useCustomCursor = () => {
  const setCursor = useStore((state) => state.setCursor);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setCursor]);

  const setHovering = (isHovering: boolean, text?: string) => {
    setCursor({ isHovering, text });
  };

  return { setHovering };
};
