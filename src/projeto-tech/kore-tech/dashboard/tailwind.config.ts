import type { Config } from 'tailwindcss'
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const koreTechPreset = require('../../../../projetos/projeto-tech/kore-tech/design/tailwind.config.preset').default as Partial<Config>

const config: Config = {
  presets: [koreTechPreset],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
}

export default config
