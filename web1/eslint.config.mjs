import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  next: true,
  formatters: true,
  typescript: true,
  rules: {
    'react-refresh/only-export-components': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
  },
  ignores: [
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'components/ui/**',
  ],
})
