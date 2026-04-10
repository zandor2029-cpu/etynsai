import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "O que é a Etyns?",
    answer:
      "A Etyns é uma plataforma de inteligência artificial que permite gerar imagens em alta qualidade (até 4K) e vídeos com controle de movimento, tudo direto do navegador.",
  },
  {
    question: "Como funciona o sistema de créditos?",
    answer:
      "Cada geração consome uma quantidade de créditos. Imagens custam menos créditos que vídeos. Você recebe créditos ao assinar um plano ou pode adquirir créditos avulsos.",
  },
  {
    question: "Quais formatos de imagem posso gerar?",
    answer:
      "Você pode gerar imagens nos formatos 1:1, 16:9, 9:16, 4:3 e 3:4, em resolução de até 4K, ideais para redes sociais, impressão e projetos profissionais.",
  },
  {
    question: "O que é o Control Motion?",
    answer:
      "O Control Motion é nossa ferramenta de geração de vídeos com IA. Você pode criar vídeos a partir de prompts de texto ou usar uma imagem como referência para animar.",
  },
  {
    question: "Posso usar as imagens e vídeos comercialmente?",
    answer:
      "Sim! Todas as imagens e vídeos gerados na Etyns são de uso livre para fins pessoais e comerciais, sem restrições de licença.",
  },
  {
    question: "Preciso instalar algum software?",
    answer:
      "Não. A Etyns funciona 100% no navegador. Basta criar uma conta, escolher um plano e começar a criar.",
  },
  {
    question: "Como faço para cancelar minha assinatura?",
    answer:
      "Você pode cancelar sua assinatura a qualquer momento pela página de Planos. O acesso continua até o fim do período já pago.",
  },
  {
    question: "Meus renders ficam salvos?",
    answer:
      'Sim! Todas as suas gerações ficam salvas na seção "Meus Renders", onde você pode visualizar, baixar ou deletar a qualquer momento.',
  },
];

const FAQ = () => {
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
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Perguntas Frequentes
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Como podemos ajudar?
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre a plataforma
            Etyns.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-5 bg-card/50 backdrop-blur-sm data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
