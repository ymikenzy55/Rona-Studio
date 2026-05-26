import { useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { isMobile } from '@/utils/helpers';

export const CustomCursor = () => {
  const cursor = useStore((state) => state.cursor);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // Smooth spring animation for cursor
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });
  const dotX = useSpring(0, { stiffness: 1000, damping: 40 });
  const dotY = useSpring(0, { stiffness: 1000, damping: 40 });

  useEffect(() => {
    // Hide on mobile
    if (isMobile()) return;

    cursorX.set(cursor.x);
    cursorY.set(cursor.y);
    dotX.set(cursor.x);
    dotY.set(cursor.y);
  }, [cursor.x, cursor.y, cursorX, cursorY, dotX, dotY]);

  // Don't render on mobile
  if (isMobile()) return null;

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: cursorX,
          top: cursorY,
          x: '-50%',
          y: '-50%',
        }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: cursor.isHovering ? 1.5 : 1,
            opacity: cursor.isHovering ? 0.5 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 border-2 border-primary-yellow rounded-full" />
          {cursor.text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         bg-primary-yellow text-primary-dark px-4 py-2 rounded-full 
                         text-sm font-semibold whitespace-nowrap"
            >
              {cursor.text}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Cursor Dot */}
      <motion.div
        ref={dotRef}
        className="fixed w-2 h-2 bg-primary-yellow rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: dotX,
          top: dotY,
          x: '-50%',
          y: '-50%',
        }}
      />
    </>
  );
};
