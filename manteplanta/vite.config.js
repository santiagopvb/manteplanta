import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Si despliegas en GitHub Pages en una subcarpeta tipo:
  // https://tuusuario.github.io/manteplanta/
  // descomenta la línea de abajo y cambia 'manteplanta' por el nombre de tu repo
  // base: '/manteplanta/',
})
