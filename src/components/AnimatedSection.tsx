import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: "fadeUp" | "fadeIn" | "scaleIn" | "slideRight" | "stagger";
}

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  variant = "fadeUp",
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Container for staggered children animations
export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ staggerChildren: staggerDelay, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hero text animation with split words
export const AnimatedText = ({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) => {
  const words = children.split(" ");
  
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.03, delayChildren: delay }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Badge animation
export const AnimatedBadge = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Card hover animation wrapper
export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
