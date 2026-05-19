import { Check, Sparkles, Loader2, Crown, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
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

  const planErrors = validatePlans();
  const checkoutBlocked = planErrors.length > 0;

  const handleSubscribe = async (planName: string, priceId: string) => {
    if (checkoutBlocked) {
      toast({ title: 'Checkout bloqueado', description: 'Configuração de planos inconsistente. Corrija antes de vender.', variant: 'destructive' });
      return;
    }
    if (!user) { setShowAuthModal(true); return; }
    setLoadingPlan(planName);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: 'Erro ao iniciar checkout', description: 'Tente novamente em alguns instantes.', variant: 'destructive' });
    } finally { setLoadingPlan(null); }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan('manage');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Portal error:', error);
      toast({ title: 'Erro ao abrir portal', description: 'Tente novamente em alguns instantes.', variant: 'destructive' });
    } finally { setLoadingPlan(null); }
  };

  const plans = Object.values(STRIPE_PLANS);

  return (
    <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-[#0a0a0a] text-white overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[800px] h-[600px] rounded-full bg-orange-500/10 blur-[180px]" />
        <div className="absolute bottom-0 right-1/3 w-[700px] h-[500px] rounded-full bg-purple-600/8 blur-[180px]" />
      </div>

      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* HERO BANNER (Higgsfield-style "30% OFF") */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-7xl mb-12"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            {/* Animated gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-700 to-purple-800" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-orange-600 to-pink-600"
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.4) 0%, transparent 50%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="relative px-6 md:px-12 py-10 md:py-16 text-center">
              <div className="inline-flex items-baseline gap-2 mb-5">
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.3em] text-white/80">Especial</span>
                <span className="text-3xl md:text-5xl font-display font-extrabold text-white">30%</span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/80">OFF</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-[0.95] mb-4 max-w-4xl mx-auto">
                Etyns Studio<br />
                <span className="text-white/85">Ilimitado por 7 dias</span>
              </h1>
              <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto">
                Imagens em 4K e vídeos cinematográficos sem limite. Aproveite o desconto especial.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto max-w-6xl">
          {/* Configuração inválida (alert) */}
          {checkoutBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border-2 border-red-500/60 bg-red-500/10"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-300 mb-1">
                    Checkout bloqueado — configuração de planos inconsistente
                  </h3>
                  <p className="text-xs text-red-300/90 mb-2">
                    Os valores em <code className="font-mono">STRIPE_PLANS</code> divergem de{' '}
                    <code className="font-mono">EXPECTED_PLAN_VALUES</code>.
                  </p>
                  <ul className="text-xs text-red-300/90 list-disc list-inside space-y-0.5">
                    {planErrors.map((err, i) => (
                      <li key={i} className="font-mono">{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section heading */}
          <div className="text-center mb-10 md:mb-12">
            <p className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.3em] text-white/50 mb-3">
              Planos
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-tight text-white leading-none mb-4">
              Escolha seu plano
            </h2>
            <p className="text-sm md:text-base text-white/60 max-w-md mx-auto">
              Desbloqueie o poder completo do Etyns Studio
            </p>

            {profile && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] text-white/60">Saldo:</span>
                <span className="text-sm font-extrabold text-white">{profile.credits}</span>
                <span className="text-[11px] text-white/50">créditos</span>
              </div>
            )}
          </div>

          {/* Free tier */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-block px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03]">
              <p className="text-[11px] md:text-xs text-white/70">
                <span className="text-orange-400 font-extrabold">10 créditos grátis</span> ao criar sua conta
              </p>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-12">
            {plans.map((plan, idx) => {
              const isCurrentPlan = subscription?.plan === plan.name;
              const isPopular = plan.popular;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                  className={`relative ${isPopular ? 'md:-mt-4' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-[0.2em] bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40">
                        <Sparkles className="w-2.5 h-2.5" />
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={`group relative h-full overflow-hidden rounded-2xl border bg-[#0f0f0f] transition-all duration-300 flex flex-col p-6 md:p-8 ${
                      isPopular
                        ? 'border-orange-500/40 hover:border-orange-500/70'
                        : isCurrentPlan
                        ? 'border-blue-500/40 hover:border-blue-500/70'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Subtle hover glow */}
                    <div
                      className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        isPopular ? 'bg-orange-500/20' : 'bg-blue-500/15'
                      }`}
                    />

                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/20 border border-blue-500/40 text-blue-300">
                          <Check className="w-2.5 h-2.5" />
                          Atual
                        </span>
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="relative mb-6">
                      <h3 className="text-xl md:text-2xl font-display font-extrabold uppercase tracking-tight text-white mb-1">
                        {plan.displayName}
                      </h3>
                      <p className="text-xs text-white/50">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="relative mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-white/50 self-start mt-2">R$</span>
                        <span className="text-5xl md:text-6xl font-display font-extrabold text-white leading-none tracking-tight">
                          {plan.price.toFixed(0)}
                        </span>
                        <span className="text-sm text-white/50">,{(plan.price.toFixed(2).split('.')[1])}/mês</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                        <Zap className="w-3 h-3 text-orange-400" />
                        <span className="text-xs font-bold text-white">{plan.credits}</span>
                        <span className="text-[10px] text-white/50">créditos/mês</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="relative space-y-2.5 mb-7 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className={`w-2.5 h-2.5 ${isPopular ? 'text-orange-400' : 'text-white/70'}`} />
                          </div>
                          <span className="text-xs md:text-sm text-white/70 leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="relative mt-auto">
                      {isCurrentPlan ? (
                        <button
                          onClick={handleManageSubscription}
                          disabled={loadingPlan === 'manage'}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-extrabold uppercase tracking-wider border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all disabled:opacity-60"
                        >
                          {loadingPlan === 'manage' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gerenciar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(plan.name, plan.priceId)}
                          disabled={loadingPlan === plan.name || checkoutBlocked}
                          title={checkoutBlocked ? 'Checkout bloqueado: configuração inconsistente' : undefined}
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-extrabold uppercase tracking-wider transition-all disabled:opacity-60 group/btn ${
                            isPopular
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/60 hover:scale-[1.02]'
                              : 'bg-white text-black hover:bg-white/90 hover:scale-[1.02]'
                          }`}
                        >
                          {loadingPlan === plan.name ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : checkoutBlocked ? (
                            'Indisponível'
                          ) : (
                            <>
                              Assinar Agora
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Credits info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 md:p-10"
          >
            <h4 className="text-base md:text-lg font-display font-extrabold uppercase tracking-tight text-white text-center mb-6">
              Como funcionam os créditos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { value: '3', label: 'créditos por imagem 4K', icon: Sparkles, color: 'text-blue-400' },
                { value: '15', label: 'créditos por vídeo motion', icon: Crown, color: 'text-purple-400' },
                { value: '∞', label: 'créditos acumulam mês a mês', icon: Zap, color: 'text-orange-400' },
              ].map((it, i) => (
                <div key={i} className="text-center">
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-white/5 border border-white/10 items-center justify-center mb-3`}>
                    <it.icon className={`w-5 h-5 ${it.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-display font-extrabold text-white mb-1">{it.value}</div>
                  <div className="text-[11px] md:text-xs text-white/50">{it.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode="signup" />
    </div>
  );
};

export default PlansPage;

