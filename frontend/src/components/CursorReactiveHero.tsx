import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CursorReactiveHeroProps {
  scrollProgress?: number;
}

export function CursorReactiveHero({ scrollProgress = 0 }: CursorReactiveHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  // Determine if dark theme
  useEffect(() => {
    const updateTheme = () => {
      const effectiveTheme = theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : theme;
      setIsDark(effectiveTheme === 'dark');
    };

    updateTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  // Colors based on theme - classical aesthetic
  const colors = {
    primary: isDark ? '#e5e7eb' : '#1f2937',      // Light gray / Dark gray
    secondary: isDark ? '#9ca3af' : '#4b5563',    // Medium gray
    accent: isDark ? '#8b5cf6' : '#7c3aed',       // Soft purple
    subtle: isDark ? '#4b5563' : '#d1d5db',       // Subtle contrast
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
      setIsMoving(true);

      // Reset moving state after animation
      setTimeout(() => setIsMoving(false), 100);
    };

    const handleMouseEnter = () => {
      setIsMoving(true);
    };

    const handleMouseLeave = () => {
      setIsMoving(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  // Calculate distance from cursor
  const getDistance = (x: number, y: number) => {
    const dx = mousePosition.x - x;
    const dy = mousePosition.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Geometric shapes that react to cursor - more sophisticated layout
  const shapes = [
    {
      id: 'circle-1',
      cx: 150,
      cy: 120,
      r: 70,
      delay: 0,
      rotate: false,
      color: colors.accent,
      intensity: 1.2,
    },
    {
      id: 'circle-2',
      cx: window.innerWidth - 180,
      cy: 150,
      r: 60,
      delay: 0.1,
      rotate: false,
      color: colors.secondary,
      intensity: 0.8,
    },
    {
      id: 'square-1',
      x: window.innerWidth / 2 - 50,
      y: window.innerHeight - 200,
      size: 120,
      delay: 0.2,
      rotate: true,
      color: colors.primary,
      intensity: 1,
    },
    {
      id: 'circle-3',
      cx: 250,
      cy: window.innerHeight - 150,
      r: 50,
      delay: 0.3,
      rotate: false,
      color: colors.subtle,
      intensity: 0.6,
    },
    {
      id: 'circle-4',
      cx: window.innerWidth - 220,
      cy: window.innerHeight - 180,
      r: 55,
      delay: 0.15,
      rotate: false,
      color: colors.accent,
      intensity: 0.9,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br transition-colors duration-300"
      style={{
        position: 'relative',
        backgroundImage: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={colors.secondary}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Interactive geometric shapes */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'normal' }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {shapes.map((shape) => {
          const distance = 'cx' in shape ? getDistance(shape.cx, shape.cy) : getDistance(shape.x + shape.size / 2, shape.y + shape.size / 2);
          const maxDistance = 350;
          const influence = Math.max(0, 1 - distance / maxDistance);
          const displacement = influence * 40 * (shape.intensity || 1);

          const dx = mousePosition.x - ('cx' in shape ? shape.cx : shape.x + shape.size / 2);
          const dy = mousePosition.y - ('cy' in shape ? shape.cy : shape.y + shape.size / 2);
          const angle = Math.atan2(dy, dx);

          const moveX = Math.cos(angle) * displacement * (isMoving ? 1 : 0.2);
          const moveY = Math.sin(angle) * displacement * (isMoving ? 1 : 0.2);

          const newX = ('cx' in shape ? shape.cx : shape.x) - moveX;
          const newY = ('cy' in shape ? shape.cy : shape.y) - moveY;

          const rotation = shape.rotate ? influence * 60 : 0;
          const glowOpacity = 0.1 + influence * 0.4;

          if ('cx' in shape && 'r' in shape) {
            return (
              <g key={shape.id}>
                {/* Glow effect */}
                <motion.circle
                  cx={newX}
                  cy={newY}
                  r={shape.r + 10}
                  fill={shape.color}
                  fillOpacity={glowOpacity * 0.3}
                  filter="url(#glow)"
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                {/* Main shape */}
                <motion.circle
                  cx={newX}
                  cy={newY}
                  r={shape.r}
                  fill={shape.color}
                  fillOpacity={0.1 + influence * 0.2}
                  stroke={shape.color}
                  strokeWidth={2.5}
                  strokeOpacity={0.4 + influence * 0.4}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </g>
            );
          } else if ('x' in shape && 'size' in shape) {
            return (
              <motion.g
                key={shape.id}
                transform={`translate(${newX} ${newY}) rotate(${rotation})`}
                style={{ transformOrigin: `${shape.size / 2}px ${shape.size / 2}px` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* Glow effect */}
                <rect
                  x={-shape.size / 2 - 8}
                  y={-shape.size / 2 - 8}
                  width={shape.size + 16}
                  height={shape.size + 16}
                  fill={shape.color}
                  fillOpacity={glowOpacity * 0.2}
                  filter="url(#glow)"
                />
                {/* Main shape */}
                <rect
                  x={-shape.size / 2}
                  y={-shape.size / 2}
                  width={shape.size}
                  height={shape.size}
                  fill={shape.color}
                  fillOpacity={0.08 + influence * 0.15}
                  stroke={shape.color}
                  strokeWidth={2.5}
                  strokeOpacity={0.35 + influence * 0.35}
                />
              </motion.g>
            );
          }

          return null;
        })}

        {/* Enhanced connecting lines */}
        {isMoving && shapes.length >= 2 && (
          <g opacity={0.25}>
            {shapes.map((shape1, i) =>
              shapes.slice(i + 1).map((shape2) => {
                const x1 = 'cx' in shape1 ? shape1.cx : shape1.x + shape1.size / 2;
                const y1 = 'cy' in shape1 ? shape1.cy : shape1.y + shape1.size / 2;
                const x2 = 'cx' in shape2 ? shape2.cx : shape2.x + shape2.size / 2;
                const y2 = 'cy' in shape2 ? shape2.cy : shape2.y + shape2.size / 2;

                const distance1 = getDistance(x1, y1);
                const distance2 = getDistance(x2, y2);
                const maxDistance = 350;

                const opacity = Math.max(
                  0,
                  (1 - distance1 / maxDistance) * (1 - distance2 / maxDistance) * 0.8
                );

                return (
                  <motion.line
                    key={`${shape1.id}-${shape2.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={colors.accent}
                    strokeWidth={2}
                    opacity={opacity * (isMoving ? 1 : 0.2)}
                    animate={{ opacity: opacity * (isMoving ? 1 : 0.2) }}
                    transition={{ duration: 0.4 }}
                  />
                );
              })
            )}
          </g>
        )}
      </svg>

      {/* Cursor indicator circle */}
      <motion.div
        className="absolute w-12 h-12 rounded-full border-2 pointer-events-none"
        style={{
          left: mousePosition.x - 24,
          top: mousePosition.y - 24,
          borderColor: colors.accent,
          opacity: isMoving ? 0.6 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
        animate={{
          scale: isMoving ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Center content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-6">
        <motion.div
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            scale: 1 - scrollProgress * 0.15,
            opacity: Math.max(0.3, 1 - scrollProgress * 0.8),
          }}
        >
          <motion.p
            className="text-xs uppercase tracking-[0.3em] mb-6"
            style={{ color: colors.secondary }}
          >
            Vibe Analytics
          </motion.p>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
            style={{ color: colors.primary }}
          >
            Understand the internet's mood —{' '}
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in real time
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-10 leading-relaxed"
            style={{ color: colors.secondary }}
          >
            Track sentiment across Twitter, Reddit, and news outlets. Detect trends before they peak. Make data-driven decisions.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Button
              asChild
              size="lg"
              className="px-8 py-6 text-base bg-accent hover:bg-accent/90 rounded-full font-semibold"
            >
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base rounded-full font-semibold"
              style={{
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
