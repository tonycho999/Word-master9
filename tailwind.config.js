/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 이 설정이 있어야 WordGuessGame.js 안의 indigo-500 같은 클래스를 인식합니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
