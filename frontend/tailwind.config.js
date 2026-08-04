/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--background)',
          secondaryBg: 'var(--secondary-bg)',
          sidebar: 'var(--sidebar-bg)',
          card: 'var(--card-bg)',
          primaryText: 'var(--primary-text)',
          secondaryText: 'var(--secondary-text)',
          mutedText: 'var(--muted-text)',
          border: 'var(--border-color)',
          accent: 'var(--accent-color)',
          accentHover: 'var(--accent-hover)',
          success: 'var(--success-color)',
          warning: 'var(--warning-color)',
          danger: 'var(--danger-color)',
          unread: 'var(--unread-badge)',
          selectedChat: 'var(--selected-chat)',
          ownBubble: 'var(--own-bubble-bg)',
          ownBubbleText: 'var(--own-bubble-text)',
          otherBubble: 'var(--other-bubble-bg)',
          otherBubbleText: 'var(--other-bubble-text)',
          inputBg: 'var(--input-bg)',
          searchBg: 'var(--search-bg)',
        }
      },
      borderRadius: {
        'input': '12px',
        'button': '12px',
        'card': '16px',
        'modal': '20px',
        'bubble': '18px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px var(--shadow-color)',
        'elevated': '0 12px 30px -4px var(--shadow-color)',
      },
      transitionDuration: {
        'default': '250ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
