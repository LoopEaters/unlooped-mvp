/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0d0d0d',
        'bg-secondary': '#1a1a1a',
        'bg-card': '#1e1e1e',
        'bg-input': '#2a2a2a',
        'border-main': '#333333',
        'text-muted': '#666666',
        'mention-project': '#a855f7',
        'mention-person': '#22c55e',
        'mention-event': '#3b82f6',
      },
    },
  },
  plugins: [],
}
