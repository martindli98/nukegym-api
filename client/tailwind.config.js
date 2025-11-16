/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },

      // ANIMACIONES PERSONALIZADAS
      keyframes: {
    fadeInUp: {
      "0%": { opacity: "0", transform: "translateY(20px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    fadeInLeft: {
      "0%": { opacity: "0", transform: "translateX(-20px)" },
      "100%": { opacity: "1", transform: "translateX(0)" },
    },
    fadeInRight: {
      "0%": { opacity: "0", transform: "translateX(20px)" },
      "100%": { opacity: "1", transform: "translateX(0)" },
    },
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
  },
  animation: {
    fadeInUp: "fadeInUp 0.8s ease-out forwards",
    fadeInLeft: "fadeInLeft 0.8s ease-out forwards",
    fadeInRight: "fadeInRight 0.8s ease-out forwards",
    fadeIn: "fadeIn 1s ease-out forwards",
  },
    },
  },
  plugins: [],
};
