import { useMemo } from 'react';

interface ValidationWarning {
  type: 'celebrity' | 'copyright' | 'adult' | 'violence' | 'other';
  message: string;
  suggestion: string;
}

interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  hasBlockingWarning: boolean;
}

const VALIDATION_PATTERNS = [
  // Celebridades da indústria adulta
  {
    pattern: /\b(mia khalifa|johnny sins|riley reid|sasha grey|lana rhoades|abella danger|alexis texas)\b/i,
    type: 'adult' as const,
    message: 'Seu prompt menciona uma celebridade da indústria adulta.',
    suggestion: 'Tente descrever uma pessoa fictícia com características específicas (ex: "mulher jovem de cabelos escuros").',
    blocking: true,
  },
  // Celebridades e figuras públicas
  {
    pattern: /\b(taylor swift|beyonce|rihanna|elon musk|trump|biden|obama|kim kardashian|kanye|drake|cristiano ronaldo|messi|neymar|anitta|ivete sangalo|xuxa)\b/i,
    type: 'celebrity' as const,
    message: 'Seu prompt menciona uma celebridade ou figura pública.',
    suggestion: 'Tente descrever características em vez de nomes (ex: "cantor pop com estilo moderno").',
    blocking: true,
  },
  // Personagens protegidos por direitos autorais
  {
    pattern: /\b(mickey mouse|minnie|donald duck|goofy|mario bros?|luigi|pikachu|pokemon|batman|superman|spider-?man|iron man|thor|hulk|captain america|harry potter|hermione|dumbledore|naruto|goku|sonic|hello kitty|spongebob|bob esponja)\b/i,
    type: 'copyright' as const,
    message: 'Seu prompt menciona um personagem protegido por direitos autorais.',
    suggestion: 'Crie um personagem original inspirado no conceito (ex: "super-herói com poderes de aranha vestindo vermelho e azul").',
    blocking: true,
  },
  // Conteúdo adulto explícito
  {
    pattern: /\b(nude?|naked|sexy|lingerie|sem roupa|pelad[oa]|porn|xxx|nsfw|erótic[oa]|sensual|sedutor[a]?)\b/i,
    type: 'adult' as const,
    message: 'Seu prompt contém termos de conteúdo adulto.',
    suggestion: 'Use descrições mais sutis ou remova termos explícitos.',
    blocking: true,
  },
  // Conteúdo violento
  {
    pattern: /\b(gore|blood|sangue|violência|violento|arma|weapon|gun|morte|dead|kill|murder|assassin|tortura)\b/i,
    type: 'violence' as const,
    message: 'Seu prompt contém termos de violência explícita.',
    suggestion: 'Tente descrever cenas de ação de forma mais sutil ou remova termos violentos.',
    blocking: false,
  },
  // Termos potencialmente problemáticos (não bloqueantes)
  {
    pattern: /\b(bikini|maiô|praia|piscina|banho)\b/i,
    type: 'other' as const,
    message: 'Seu prompt contém termos que podem ser sensíveis dependendo do contexto.',
    suggestion: 'Adicione mais contexto para evitar interpretações ambíguas.',
    blocking: false,
  },
];

export function validatePrompt(prompt: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  let hasBlockingWarning = false;

  const lowerPrompt = prompt.toLowerCase();

  for (const rule of VALIDATION_PATTERNS) {
    if (rule.pattern.test(lowerPrompt)) {
      warnings.push({
        type: rule.type,
        message: rule.message,
        suggestion: rule.suggestion,
      });
      if (rule.blocking) {
        hasBlockingWarning = true;
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    hasBlockingWarning,
  };
}

export function usePromptValidation(prompt: string): ValidationResult {
  return useMemo(() => validatePrompt(prompt), [prompt]);
}
