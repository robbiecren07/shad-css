import { defineConfig, globalIgnores } from 'eslint/config'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  globalIgnores(['**/node_modules/', '**/dist/', '**/build/']),
  {
    extends: compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
    plugins: {},

    settings: {
      next: {
        rootDir: ['apps/*/'],
      },
    },

    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      '@next/next/no-html-link-for-pages': 'off',

      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'export',
        },
        {
          blankLine: 'always',
          prev: 'block-like',
          next: 'const',
        },
        {
          blankLine: 'always',
          prev: 'directive',
          next: '*',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: tsParser,
    },
  },
])
