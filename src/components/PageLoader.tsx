import { motion } from "framer-motion";

export const PageLoader = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated watermelon loader */}
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-watermelon-green/20" />
          <motion.div
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-watermelon-green border-r-watermelon-pink"
            style={{ borderRadius: "50%" }}
          />
        </motion.div>
        
        {/* Loading text with shimmer */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-lg font-display font-bold text-gradient-watermelon">
            Carregando
          </span>
          <motion.span
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-watermelon-green"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PageLoader;
