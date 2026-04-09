import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Etyns Extended Palette
        etyns: {
          "blue-dark": "hsl(var(--et-blue-dark))",
          blue: "hsl(var(--et-blue))",
          "blue-light": "hsl(var(--et-blue-light))",
          "blue-neon": "hsl(var(--et-blue-neon))",
          "cyan-dark": "hsl(var(--et-cyan-dark))",
          cyan: "hsl(var(--et-cyan))",
          "cyan-light": "hsl(var(--et-cyan-light))",
          "cyan-neon": "hsl(var(--et-cyan-neon))",
          purple: "hsl(var(--et-purple))",
          "purple-neon": "hsl(var(--et-purple-neon))",
          deep: "hsl(var(--et-deep))",
          "deep-light": "hsl(var(--et-deep-light))",
          ice: "hsl(var(--et-ice))",
          "ice-dark": "hsl(var(--et-ice-dark))",
        },
        // Keep backward compat aliases
        watermelon: {
          "green-dark": "hsl(var(--et-blue-dark))",
          green: "hsl(var(--et-blue))",
          "green-light": "hsl(var(--et-blue-light))",
          "green-neon": "hsl(var(--et-blue-neon))",
          "red-dark": "hsl(var(--et-cyan-dark))",
          red: "hsl(var(--et-cyan))",
          "red-light": "hsl(var(--et-cyan-light))",
          pink: "hsl(var(--et-purple))",
          "pink-neon": "hsl(var(--et-purple-neon))",
          coral: "hsl(var(--et-cyan))",
          seed: "hsl(var(--et-deep))",
          "seed-light": "hsl(var(--et-deep-light))",
          cream: "hsl(var(--et-ice))",
          "cream-dark": "hsl(var(--et-ice-dark))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        "glow-blue": "0 0 30px hsl(210 100% 60% / 0.5), 0 0 60px hsl(210 100% 60% / 0.3)",
        "glow-cyan": "0 0 30px hsl(190 100% 50% / 0.5), 0 0 60px hsl(190 100% 50% / 0.3)",
        "glow-rgb": "0 0 20px hsl(210 100% 60% / 0.4), 0 0 40px hsl(190 100% 50% / 0.3), 0 0 60px hsl(260 100% 65% / 0.2)",
        "etyns": "0 8px 32px hsl(220 20% 4% / 0.5), 0 0 40px hsl(210 100% 60% / 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "rgb-flow": {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "300% center" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(210 100% 60% / 0.4), 0 0 40px hsl(190 100% 50% / 0.2)"
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(210 100% 60% / 0.6), 0 0 80px hsl(190 100% 50% / 0.4)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "rgb-flow": "rgb-flow 4s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
