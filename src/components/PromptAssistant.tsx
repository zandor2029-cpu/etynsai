import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Lightbulb, Copy, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PromptSuggestions {
  enhanced: string;
  suggestions: string[];
  tips: string[];
}

interface PromptAssistantProps {
  suggestions: PromptSuggestions | null;
  isLoading: boolean;
  onApplyEnhanced: (enhanced: string) => void;
  onApplySuggestion: (suggestion: string) => void;
  onClose: () => void;
}

const PromptAssistant = ({
  suggestions,
  isLoading,
  onApplyEnhanced,
  onApplySuggestion,
  onClose,
}: PromptAssistantProps) => {
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);

  const handleCopyEnhanced = async () => {
    if (suggestions?.enhanced) {
      await navigator.clipboard.writeText(suggestions.enhanced);
      setCopiedEnhanced(true);
      setTimeout(() => setCopiedEnhanced(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="glass-card p-4 rounded-xl border border-watermelon-green/30 bg-watermelon-green/5"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="w-5 h-5 text-watermelon-green animate-spin" />
            <div className="absolute inset-0 blur-sm">
              <Sparkles className="w-5 h-5 text-watermelon-green animate-pulse" />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            Analisando seu prompt com IA...
          </span>
        </div>
      </motion.div>
    );
  }

  if (!suggestions) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="glass-card p-4 rounded-xl border border-watermelon-green/30 bg-gradient-to-br from-watermelon-green/5 to-watermelon-pink/5 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-watermelon-green to-watermelon-pink">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Assistente de Prompts IA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar assistente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Enhanced Prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-watermelon-green">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Prompt Aprimorado</span>
          </div>
          <div className="relative group">
            <p className="text-sm text-foreground/90 bg-muted/30 rounded-lg p-3 pr-20 border border-border/50">
              {suggestions.enhanced}
            </p>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyEnhanced}
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedEnhanced ? (
                  <Check className="w-3.5 h-3.5 text-watermelon-green" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => onApplyEnhanced(suggestions.enhanced)}
                className="h-7 px-2 text-xs bg-watermelon-green hover:bg-watermelon-green/90 text-white"
              >
                Usar
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-watermelon-pink">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adicionar ao prompt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onApplySuggestion(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full bg-watermelon-pink/10 border border-watermelon-pink/30 text-foreground hover:bg-watermelon-pink/20 hover:border-watermelon-pink/50 transition-colors"
                >
                  + {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {suggestions.tips.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Dicas</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {suggestions.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-watermelon-green">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptAssistant;
