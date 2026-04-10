import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy } from "react";
import PageLoader from "./PageLoader";

// Lazy load pages for better performance
const Index = lazy(() => import("@/pages/Index"));
const NanoBananaPro = lazy(() => import("@/pages/NanoBananaPro"));
const KlingMotionControl = lazy(() => import("@/pages/KlingMotionControl"));
const MeusRenders = lazy(() => import("@/pages/MeusRenders"));
const PlansPage = lazy(() => import("@/pages/PlansPage"));
const HistoricoCreditos = lazy(() => import("@/pages/HistoricoCreditos"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.99,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.99,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.4,
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/image" element={<NanoBananaPro />} />
            <Route path="/nano-banana-pro" element={<NanoBananaPro />} />
            <Route path="/motion-control" element={<KlingMotionControl />} />
            <Route path="/meus-renders" element={<MeusRenders />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/historico" element={<HistoricoCreditos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
