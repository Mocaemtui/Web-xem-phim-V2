import { motion, AnimatePresence } from 'framer-motion';
import type { Reaction } from '@/hooks/useWatchTogether';

interface FloatingReactionsProps {
  reactions: Reaction[];
}

export default function FloatingReactions({ reactions }: FloatingReactionsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 50, scale: 0.5, x: `${reaction.x}%` }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -200, 
              scale: [0.5, 1.5, 1.2, 1],
              x: `${reaction.x + (Math.random() * 10 - 5)}%` 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute bottom-0 text-4xl"
            style={{ left: 0, right: 0 }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
