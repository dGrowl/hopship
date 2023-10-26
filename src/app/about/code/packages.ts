import argon2 from './licenses/argon2'
import bootstrapIcons from './licenses/bootstrap-icons'
import eslintConfigNext from './licenses/eslint-config-next'
import eslint from './licenses/eslint'
import next from './licenses/next'
import pg from './licenses/pg'
import prettier from './licenses/prettier'
import reactDom from './licenses/react-dom'
import reactIcons from './licenses/react-icons'
import react from './licenses/react'
import typesNode from './licenses/types-node'
import typesPg from './licenses/types-pg'
import typesReactDom from './licenses/types-react-dom'
import typesReact from './licenses/types-react'
import typescript from './licenses/typescript'

interface PackageData {
  name: string
  license: string
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
    name: 'typescript',
    license: typescript,
  },
  {
    name: 'prettier',
    license: prettier,
  },
] as readonly PackageData[]

export default PACKAGES
