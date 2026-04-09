import { Coins, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_COSTS } from '@/config/plans';

interface CreditDisplayProps {
  compact?: boolean;
}

const CreditDisplay = ({ compact = false }: CreditDisplayProps) => {
  const { profile, subscription } = useAuth();

  const credits = profile?.credits ?? 0;
  const planName = subscription?.plan;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-etyns-blue/20 to-etyns-purple/20 border border-etyns-blue/30">
        <Coins className="w-4 h-4 text-etyns-blue" />
        <span className="font-bold text-etyns-blue-light">{credits}</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-etyns-blue/20 to-etyns-purple/20">
            <Coins className="w-5 h-5 text-etyns-blue" />
          </div>
          <span className="font-semibold text-foreground">Seus Créditos</span>
        </div>
        {planName && (
          <span className="badge-watermelon text-xs">
            {planName.charAt(0).toUpperCase() + planName.slice(1)}
          </span>
        )}
      </div>

      <div className="text-3xl font-display font-bold text-gradient-watermelon mb-3">
        {credits}
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Imagem 4K</span>
          <span>{CREDIT_COSTS.image} créditos</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Vídeo Motion</span>
          <span>{CREDIT_COSTS.video} créditos</span>
        </div>
      </div>
    </div>
  );
};

export default CreditDisplay;
