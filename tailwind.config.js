/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        // Legal-Tech Palette
        primary: '#059669', // Verde esmeralda
        'primary-dark': '#047857', // Verde oscuro
        secondary: '#0F172A', // Azul petróleo
        accent: '#D97706', // Dorado suave
        
        // Fondos
        'bg-light': '#F8FAFC', // Gris muy claro
        'bg-green': '#ECFDF5', // Verde muy suave
        
        // Textos
        'text-primary': '#111827', // Principal
        'text-secondary': '#4B5563', // Secundario
        'text-muted': '#6B7280', // Muted
        
        // Estados
        danger: '#DC2626', // Error
        success: '#16A34A', // Éxito
        warning: '#F59E0B', // Advertencia
        
        // Bordes
        border: '#E5E7EB',
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
