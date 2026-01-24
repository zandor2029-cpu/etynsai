import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lightbulb, X } from 'lucide-react';

interface ValidationWarning {
  type: 'celebrity' | 'copyright' | 'adult' | 'violence' | 'other';
  message: string;
  suggestion: string;
}

interface PromptWarningProps {
  warnings: ValidationWarning[];
  hasBlockingWarning: boolean;
  onDismiss?: () => void;
}

const typeColors = {
  celebrity: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
  copyright: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  adult: 'border-red-500/30 bg-red-500/10 text-red-200',
  violence: 'border-red-500/30 bg-red-500/10 text-red-200',
  other: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
};

const typeLabels = {
  celebrity: 'Celebridade',
  copyright: 'Direitos Autorais',
  adult: 'Conteúdo Adulto',
  violence: 'Violência',
  other: 'Atenção',
};

export function PromptWarning({ warnings, hasBlockingWarning, onDismiss }: PromptWarningProps) {
  if (warnings.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <div className={`rounded-xl border p-4 ${hasBlockingWarning ? 'border-red-500/30 bg-red-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${hasBlockingWarning ? 'text-red-400' : 'text-yellow-400'}`} />
              <div className="space-y-3">
                <p className={`font-medium ${hasBlockingWarning ? 'text-red-200' : 'text-yellow-200'}`}>
                  {hasBlockingWarning 
                    ? '⚠️ Este prompt provavelmente será bloqueado'
                    : '💡 Dica para melhorar seu prompt'}
                </p>
                
                {warnings.map((warning, index) => (
                  <div key={index} className={`rounded-lg border p-3 ${typeColors[warning.type]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                        {typeLabels[warning.type]}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{warning.message}</p>
                    <div className="flex items-start gap-2 mt-2 pt-2 border-t border-current/20">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-70" />
                      <p className="text-sm opacity-80">{warning.suggestion}</p>
                    </div>
                  </div>
                ))}

                {hasBlockingWarning && (
                  <p className="text-sm text-red-300/80">
                    Você ainda pode tentar gerar, mas o modelo provavelmente recusará esta solicitação.
                  </p>
                )}
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
