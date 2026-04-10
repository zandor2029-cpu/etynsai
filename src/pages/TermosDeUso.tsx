import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollText } from "lucide-react";

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content:
      "Ao acessar e utilizar a plataforma Etyns, você concorda com estes Termos de Uso. Caso não concorde com alguma das condições aqui descritas, não utilize nossos serviços.",
  },
  {
    title: "2. Descrição do Serviço",
    content:
      "A Etyns é uma plataforma de geração de imagens e vídeos por inteligência artificial. O serviço permite que usuários criem conteúdos visuais a partir de prompts de texto e imagens de referência.",
  },
  {
    title: "3. Cadastro e Conta",
    content:
      "Para utilizar os serviços da Etyns, é necessário criar uma conta com informações verdadeiras. Você é responsável por manter a segurança de sua conta e senha. A Etyns não se responsabiliza por acessos não autorizados à sua conta.",
  },
  {
    title: "4. Créditos e Pagamentos",
    content:
      "A utilização da plataforma é baseada em um sistema de créditos. Os créditos podem ser adquiridos através de planos de assinatura. Os créditos não são reembolsáveis e têm validade conforme o plano contratado. Os preços podem ser alterados mediante aviso prévio.",
  },
  {
    title: "5. Uso do Conteúdo Gerado",
    content:
      "O conteúdo gerado através da plataforma pode ser utilizado para fins pessoais e comerciais. A Etyns não se responsabiliza pelo uso indevido do conteúdo gerado pelo usuário. É proibido gerar conteúdo ilegal, ofensivo, que viole direitos de terceiros ou que seja considerado prejudicial.",
  },
  {
    title: "6. Propriedade Intelectual",
    content:
      "A marca Etyns, logotipos, design da plataforma e tecnologia subjacente são propriedade exclusiva da Etyns. O conteúdo gerado pelo usuário através da plataforma pertence ao usuário, respeitadas as limitações técnicas e legais aplicáveis.",
  },
  {
    title: "7. Limitação de Responsabilidade",
    content:
      'A plataforma é fornecida "como está". A Etyns não garante que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por danos indiretos, incidentais ou consequentes decorrentes do uso da plataforma.',
  },
  {
    title: "8. Cancelamento e Suspensão",
    content:
      "O usuário pode cancelar sua conta a qualquer momento. A Etyns reserva-se o direito de suspender ou encerrar contas que violem estes termos. Em caso de cancelamento, créditos restantes não são reembolsáveis.",
  },
  {
    title: "9. Privacidade",
    content:
      "A Etyns coleta e processa dados pessoais conforme descrito em nossa Política de Privacidade. Utilizamos cookies e tecnologias similares para melhorar a experiência do usuário. Seus dados não são vendidos a terceiros.",
  },
  {
    title: "10. Alterações nos Termos",
    content:
      "A Etyns pode atualizar estes Termos de Uso a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma. O uso continuado após alterações constitui aceitação dos novos termos.",
  },
];

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <ScrollText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Última atualização: Abril de 2026
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosDeUso;
