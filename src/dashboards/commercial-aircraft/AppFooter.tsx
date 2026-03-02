/** Shared footer — standalone for commercial-aircraft dashboard. */

import { motion } from "framer-motion";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

interface AppFooterProps {
  sourceText?: string;
  unitText?: string;
}

const AppFooter = ({ sourceText, unitText }: AppFooterProps) => {
  return (
    <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 border-t border-border pt-6">
      <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div>
          {sourceText && <p className="text-sm text-muted-foreground">{sourceText}</p>}
          {unitText && <p className="text-xs text-muted-foreground/70">{unitText}</p>}
        </div>
        <img src={stratviewLogoWhite} alt="Stratview Research" className="h-10 w-auto" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground/60">
        <a href="/terms" className="hover:text-muted-foreground transition-colors">Terms &amp; Privacy Policy</a>
        <span>·</span>
        <a href="/disclaimer" className="hover:text-muted-foreground transition-colors">Disclaimer</a>
        <span>·</span>
        <a href="mailto:support@stratviewresearch.com" className="hover:text-muted-foreground transition-colors">Support</a>
      </div>
    </motion.footer>
  );
};

export default AppFooter;
