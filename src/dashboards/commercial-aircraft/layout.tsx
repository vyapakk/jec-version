/**
 * Layout components for Commercial Aircraft Combined dashboard.
 * Standalone — copied from sibling dashboards.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

export function DashboardHeader({ title = "Commercial Aircraft Orders & Deliveries", subtitle = "Airbus & Boeing Combined Dashboard" }: { title?: string; subtitle?: string }) {
  return (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      <div className="container relative mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start md:items-center gap-3 md:gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="shrink-0">
              <img src={stratviewLogoWhite} alt="Stratview Research" className="h-12 md:h-20 w-auto object-contain" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground break-words">{title}</h1>
              <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2 border border-border">
            <div className="h-2 w-2 rounded-full bg-chart-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">Data updated: Q1 2026</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-10 w-32" />
            </motion.div>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </main>
    </div>
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          aria-label="Scroll to top">
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
