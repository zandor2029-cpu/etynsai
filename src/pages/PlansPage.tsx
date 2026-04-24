import { Check, Sparkles, Loader2, Crown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PLANS, validatePlans } from '@/config/plans';
import AuthModal from '@/components/AuthModal';
import { useToast } from '@/hooks/use-toast';

const PlansPage = () => {
  const { user, subscription, profile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  // Trava de segurança: se a configuração de planos estiver dessincronizada
  // com EXPECTED_PLAN_VALUES, bloqueia o checkout para evitar vender com
  // preço/créditos errados.
  const planErrors = validatePlans();
  const checkoutBlocked = planErrors.length > 0;

  const handleSubscribe = async (planName: string, priceId: string) => {
    if (checkoutBlocked) {
      toast({
        title: 'Checkout bloqueado',
        description: 'Configuração de planos inconsistente. Corrija antes de vender.',
        variant: 'destructive',
      });
      return;
    }
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
      if (data?.url) window.open(data.url, '_blank');
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
      if (data?.url) window.open(data.url, '_blank');
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
    <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/8 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/8 blur-[160px]" />
      </div>

      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="container mx-auto max-w-5xl">
          {/* Aviso crítico de configuração inconsistente */}
          {checkoutBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border-2 border-destructive bg-destructive/10"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-destructive mb-1">
                    ⚠️ Checkout bloqueado — configuração de planos inconsistente
                  </h3>
                  <p className="text-xs text-destructive/90 mb-2">
                    Os valores em <code className="font-mono">STRIPE_PLANS</code> divergem de{' '}
                    <code className="font-mono">EXPECTED_PLAN_VALUES</code>. Corrija{' '}
                    <code className="font-mono">src/config/plans.ts</code> antes de aceitar pagamentos.
                  </p>
                  <ul className="text-xs text-destructive/90 list-disc list-inside space-y-0.5">
                    {planErrors.map((err, i) => (
                      <li key={i} className="font-mono">{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 border border-border/60 mb-4"
            >
              <Crown className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Planos Premium</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl md:text-4xl font-display font-extrabold mb-2 text-gradient-watermelon tracking-tight"
            >
              Escolha seu Plano
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm text-muted-foreground max-w-md mx-auto"
            >
              Desbloqueie o poder completo da Etyns
            </motion.p>

            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-card/95"
              >
                <span className="text-[11px] text-muted-foreground">Saldo:</span>
                <span className="text-sm font-bold text-gradient-watermelon">{profile.credits} créditos</span>
              </motion.div>
            )}
          </div>

          {/* Free tier info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="text-center mb-6"
          >
            <div className="inline-block px-4 py-2 rounded-xl border border-border/60 bg-card/95">
              <p className="text-[11px] text-muted-foreground">
                🎁 <span className="text-primary font-bold">10 créditos grátis</span> ao criar sua conta
              </p>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
            {plans.map((plan, idx) => {
              const isCurrentPlan = subscription?.plan === plan.name;
              const isPopular = plan.popular;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + idx * 0.08 }}
                  className={`relative ${isPopular ? 'md:-mt-3 md:mb-3' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={`h-full p-5 rounded-xl border bg-card/95 shadow-lg transition-all flex flex-col ${
                      isPopular
                        ? 'border-primary/50 shadow-primary/15'
                        : isCurrentPlan
                        ? 'border-primary/40 shadow-primary/10'
                        : 'border-border/60 shadow-primary/5'
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-primary/15 border border-primary/30 text-primary">
                          <Check className="w-2.5 h-2.5" />
                          Seu Plano
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-base font-display font-bold text-foreground mb-0.5">
                        {plan.displayName}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-4">
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-[10px] text-muted-foreground">R$</span>
                        <span
                          className={`text-2xl font-display font-extrabold ${
                            isPopular ? 'text-gradient-watermelon' : 'text-foreground'
                          }`}
                        >
                          {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/mês</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-sm font-bold text-primary">{plan.credits}</span>
                        <span className="text-[10px] text-muted-foreground"> créditos/mês</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-5 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-muted-foreground leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-auto">
                      {isCurrentPlan ? (
                        <button
                          onClick={handleManageSubscription}
                          disabled={loadingPlan === 'manage'}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-border/60 bg-card hover:bg-muted/50 transition-all disabled:opacity-60"
                        >
                          {loadingPlan === 'manage' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Gerenciar Assinatura'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(plan.name, plan.priceId)}
                          disabled={loadingPlan === plan.name || checkoutBlocked}
                          title={checkoutBlocked ? 'Checkout bloqueado: configuração inconsistente' : undefined}
                          className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-60 ${
                            isPopular
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                              : 'border border-border/60 bg-card hover:bg-muted/50'
                          }`}
                        >
                          {loadingPlan === plan.name ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : checkoutBlocked ? (
                            'Indisponível'
                          ) : (
                            'Assinar Agora'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Credit costs info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="text-center"
          >
            <div className="inline-block px-5 py-4 rounded-xl border border-border/60 bg-card/95">
              <h4 className="text-xs font-display font-bold text-foreground mb-3 uppercase tracking-wider">
                Como funcionam os créditos?
              </h4>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">3</div>
                  <div className="text-[10px] text-muted-foreground">créditos/imagem 4K</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-etyns-purple">15</div>
                  <div className="text-[10px] text-muted-foreground">créditos/vídeo motion</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">∞</div>
                  <div className="text-[10px] text-muted-foreground">créditos acumulam</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode="signup" />
    </div>
  );
};

export default PlansPage;
