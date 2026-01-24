import { Check, Sparkles, Loader2, Crown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PLANS } from '@/config/plans';
import GlassCard from '@/components/GlassCard';
import WatermelonButton from '@/components/WatermelonButton';
import AuthModal from '@/components/AuthModal';
import { useToast } from '@/hooks/use-toast';

const PlansPage = () => {
  const { user, subscription, profile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (planName: string, priceId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoadingPlan(planName);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro ao iniciar checkout',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan('manage');

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Erro ao abrir portal',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = Object.values(STRIPE_PLANS);

  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge-rgb mb-4">
            <Crown className="w-4 h-4" />
            <span>Planos Premium</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            <span className="text-gradient-rgb">Escolha seu Plano</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie o poder completo da <span className="text-watermelon-green-light font-semibold">Watermelon IA</span>
          </p>

          {profile && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 glass-card rounded-full">
              <span className="text-muted-foreground">Seu saldo:</span>
              <span className="text-xl font-bold text-gradient-watermelon">{profile.credits} créditos</span>
            </div>
          )}
        </div>

        {/* Free tier info */}
        <div className="text-center mb-10">
          <GlassCard className="inline-block px-6 py-3">
            <p className="text-muted-foreground">
              🎁 <span className="text-watermelon-green font-semibold">10 créditos grátis</span> ao criar sua conta!
            </p>
          </GlassCard>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, index) => {
            const isCurrentPlan = subscription?.plan === plan.name;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.name}
                className={`relative animate-fade-in-up ${isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="badge-rgb px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1 inline" />
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className={`h-full ${isPopular ? 'rgb-border p-[2px] rounded-3xl' : ''}`}>
                  <GlassCard 
                    className={`h-full p-6 md:p-8 rounded-3xl ${isCurrentPlan ? 'border-2 border-watermelon-green' : ''}`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <span className="badge-watermelon text-xs">
                          <Check className="w-3 h-3 mr-1 inline" />
                          Seu Plano
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-display font-bold text-foreground mb-1">
                        {plan.displayName}
                      </h3>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <span className={`text-4xl font-display font-bold ${isPopular ? 'text-gradient-watermelon' : 'text-foreground'}`}>
                          {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-watermelon-green">{plan.credits}</span>
                        <span className="text-muted-foreground"> créditos/mês</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-watermelon-green shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-auto">
                      {isCurrentPlan ? (
                        <WatermelonButton
                          onClick={handleManageSubscription}
                          loading={loadingPlan === 'manage'}
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          {loadingPlan === 'manage' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            'Gerenciar Assinatura'
                          )}
                        </WatermelonButton>
                      ) : (
                        <WatermelonButton
                          onClick={() => handleSubscribe(plan.name, plan.priceId)}
                          loading={loadingPlan === plan.name}
                          variant={isPopular ? 'primary' : 'outline'}
                          size="lg"
                          className="w-full"
                        >
                          {loadingPlan === plan.name ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            'Assinar Agora'
                          )}
                        </WatermelonButton>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credit costs info */}
        <div className="text-center">
          <GlassCard className="inline-block px-8 py-6">
            <h4 className="font-display font-bold text-foreground mb-4">Como funcionam os créditos?</h4>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-watermelon-green">3</div>
                <div className="text-sm text-muted-foreground">créditos/imagem 4K</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-watermelon-pink">10</div>
                <div className="text-sm text-muted-foreground">créditos/vídeo motion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">∞</div>
                <div className="text-sm text-muted-foreground">créditos acumulam</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode="signup"
      />
    </div>
  );
};

export default PlansPage;
