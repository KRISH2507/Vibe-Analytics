import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export function LampToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-24 flex flex-col items-center justify-end pb-2 group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Lamp cord */}
      <motion.div
        className="absolute top-0 w-0.5 bg-muted-foreground/40"
        initial={{ height: 20 }}
        animate={{ height: isDark ? 28 : 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />

      {/* Lamp shade */}
      <motion.div
        className="relative z-10"
        animate={{ y: isDark ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div
          className="w-10 h-6 rounded-b-full border-2 border-muted-foreground/40 relative overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, hsl(45 80% 70%) 0%, hsl(35 90% 60%) 100%)'
              : 'hsl(var(--muted))',
          }}
        >
          {/* Light glow effect */}
          <motion.div
            className="absolute inset-0 rounded-b-full"
            animate={{
              opacity: isDark ? 1 : 0,
              boxShadow: isDark
                ? '0 8px 30px 10px hsl(45 80% 70% / 0.4), 0 4px 15px 5px hsl(35 90% 60% / 0.6)'
                : 'none',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Lamp base */}
        <div className="w-3 h-1.5 bg-muted-foreground/40 mx-auto rounded-b" />
      </motion.div>

      {/* Pull string */}
      <motion.div
        className="absolute bottom-6 w-0.5 h-4 bg-muted-foreground/30 rounded-full"
        animate={{ y: isDark ? 2 : 0 }}
        whileHover={{ y: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      />

      {/* Pull knob */}
      <motion.div
        className="absolute bottom-4 w-2 h-2 rounded-full bg-muted-foreground/50"
        animate={{ y: isDark ? 2 : 0 }}
        whileHover={{ y: 4, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      />

      {/* Light cone effect when dark mode */}
      {isDark && (
        <motion.div
          className="absolute top-14 w-20 h-32 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          style={{
            background: 'linear-gradient(180deg, hsl(45 80% 70%) 0%, transparent 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
      )}
    </button>
  );
}
