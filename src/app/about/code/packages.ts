import argon2 from './licenses/argon2'
import bootstrapIcons from './licenses/bootstrap-icons'
import eslint from './licenses/eslint'
import eslintConfigNext from './licenses/eslint-config-next'
import jose from './licenses/jose'
import next from './licenses/next'
import pg from './licenses/pg'
import prettier from './licenses/prettier'
import react from './licenses/react'
import reactDom from './licenses/react-dom'
import reactIcons from './licenses/react-icons'
import typebox from './licenses/typebox'
import typescript from './licenses/typescript'
import typesNode from './licenses/types-node'
import typesPg from './licenses/types-pg'
import typesReact from './licenses/types-react'
import typesReactDom from './licenses/types-react-dom'
import vitest from './licenses/vitest'

interface PackageData {
  readonly name: string
  readonly license: string
}

const PACKAGES = [
  {
    name: '@types/node',
    license: typesNode,
  },
  {
    name: '@types/pg',
    license: typesPg,
  },
  {
    name: '@types/react',
    license: typesReact,
  },
  {
    name: '@types/react-dom',
    license: typesReactDom,
  },
  {
    name: 'argon2',
    license: argon2,
  },
  {
    name: 'eslint',
    license: eslint,
  },
  {
    name: 'eslint-config-next',
    license: eslintConfigNext,
  },
  {
    name: 'jose',
    license: jose,
  },
  {
    name: 'next',
    license: next,
  },
  {
    name: 'pg',
    license: pg,
  },
  {
    name: 'react',
    license: react,
  },
  {
    name: 'react-dom',
    license: reactDom,
  },
  {
    name: 'react-icons',
    license: reactIcons,
  },
  {
    name: 'bootstrap-icons',
    license: bootstrapIcons,
  },
  {
    name: 'typebox',
    license: typebox,
  },
  {
    name: 'typescript',
    license: typescript,
  },
  {
    name: 'prettier',
    license: prettier,
  },
  {
    name: 'vitest',
    license: vitest,
  },
] as readonly PackageData[]

export default PACKAGES
