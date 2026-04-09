import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import WatermelonButton from './WatermelonButton';

interface NoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video';
  creditsNeeded: number;
  currentCredits: number;
}

const NoCreditsModal = ({ isOpen, onClose, type, creditsNeeded, currentCredits }: NoCreditsModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubscribe = () => {
    onClose();
    navigate('/planos');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="rgb-border p-[2px] rounded-3xl animate-scale-in relative z-10 w-full max-w-md">
        <GlassCard className="p-6 md:p-8 rounded-3xl text-center">
          {/* Icon */}
          <div className="inline-flex p-4 rounded-2xl bg-secondary/20 mb-6">
            <Lock className="w-12 h-12 text-secondary" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-display font-bold mb-3">
            Créditos Insuficientes 😢
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            Você precisa de <span className="text-etyns-purple font-bold">{creditsNeeded} créditos</span> para 
            gerar {type === 'image' ? 'uma imagem' : 'um vídeo'}, mas tem apenas{' '}
            <span className="text-primary font-bold">{currentCredits} créditos</span>.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentCredits}</div>
              <div className="text-xs text-muted-foreground">Você tem</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{creditsNeeded}</div>
              <div className="text-xs text-muted-foreground">Necessário</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <WatermelonButton onClick={handleSubscribe} size="lg" className="w-full">
              <Sparkles className="w-5 h-5" />
              Ver Planos Premium
            </WatermelonButton>
            <button
              onClick={onClose}
              className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              Fechar
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default NoCreditsModal;
