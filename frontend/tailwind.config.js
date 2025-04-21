/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          border: '#333333',
          card: '#1A1A1A',
          elevated: '#242424',
        },
        // Purple gradient colors
        purple: {
          light: '#a855f7', // Purple-500
          DEFAULT: '#8b5cf6', // Violet-500
          dark: '#7c3aed', // Violet-600
          darker: '#6d28d9', // Violet-700
        },
        // Text colors
        text: {
          primary: '#F5F5F5',
          secondary: '#A0A0A0',
          muted: '#6B6B6B',
          accent: '#c4b5fd', // Violet-300
        },
      },
      // Custom box shadow for elements
      boxShadow: {
        purple: '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
        'purple-lg': '0 8px 30px 0 rgba(139, 92, 246, 0.4)',
      },
      // Custom gradient for buttons and accents
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        'purple-gradient-hover':
          'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Using class to manage dark mode
};
