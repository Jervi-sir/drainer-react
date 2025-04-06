import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ngrok } from 'vite-plugin-ngrok'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ngrok('1yL3SpT7r01BIju8hMNugOayVTP_3fHAKWgTYpuwcZKqwKsAj'),
  ],
})
