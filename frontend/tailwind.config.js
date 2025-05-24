// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ← 이 줄이 반드시 있어야 Tailwind가 App.jsx 파일을 분석함!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
