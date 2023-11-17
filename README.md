# hopship

A searchable social index. Look up one of your friend's accounts to find their others!

Currently a work in progress, but deployed as an alpha to [hopship.social](https://hopship.social), hosted by [vercel](https://vercel.com/).

## Installation

Install [Node.js](https://nodejs.org/en/download) >= 18 if you need it (I'd personally recommend [asdf](https://asdf-vm.com/) to manage your Node installs), then run `$ npm i`.

## Usage

Run one of the following scripts with `$ npm run {NAME}`:

| Name | Description |
|------|-------------|
| `dev` | Starts a development server with hot module reloading. |
| `build` | Generates a production build. Necessary prior to `start`. |
| `start` | Starts a production server. |
| `lint` | Static analysis using [ESLint](https://eslint.org/). |
| `format` | Formats the contents of the `src` directory using [Prettier](https://prettier.io/). |
| `test` | Test suite using [Vitest](https://vitest.dev/). |

`dev`, `start`, and `test` rely on a handful of environment variables--check `lib/env.ts` to figure out what you'll need.

## Dependencies

| Name | Version | License |
|------|---------|---------|
| **[@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox)** | ^0.31.22 | [MIT](https://github.com/sinclairzx81/typebox/blob/master/license) |
| **[@types/node](https://www.npmjs.com/package/@types/node)** |  18.11.9 | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) |
| **[@types/pg](https://www.npmjs.com/package/@types/pg)** |  ^8.6.5 | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) |
| **[@types/react](https://www.npmjs.com/package/@types/react)** |  ^18.2.9 | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) |
| **[@types/react-dom](https://www.npmjs.com/package/@types/react-dom)** |  ^18.2.4 | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) |
| **[argon2](https://www.npmjs.com/package/argon2)** |  ^0.31.1 | [MIT](https://github.com/ranisalt/node-argon2/blob/master/LICENSE) |
| **[eslint](https://www.npmjs.com/package/eslint)** |  ^8.42.0 | [MIT](https://github.com/eslint/eslint/blob/main/LICENSE) |
| **[eslint-config-next](https://www.npmjs.com/package/eslint-config-next)** |  ^14.0.1 | [MIT](https://github.com/vercel/next.js/blob/canary/license.md) |
| **[jose](https://www.npmjs.com/package/jose)** |  ^5.1.0 | [MIT](https://github.com/panva/jose/blob/main/LICENSE.md) |
| **[next](https://www.npmjs.com/package/next)** |  ^14.0.1 | [MIT](https://github.com/vercel/next.js/blob/canary/license.md) |
| **[pg](https://www.npmjs.com/package/pg)** |  ^8.8.0 | [MIT](https://github.com/brianc/node-postgres/blob/master/LICENSE) |
| **[react](https://www.npmjs.com/package/react)** |  18.2.0 | [MIT](https://github.com/facebook/react/blob/main/LICENSE) |
| **[react-dom](https://www.npmjs.com/package/react-dom)** |  18.2.0 | [MIT](https://github.com/facebook/react/blob/main/LICENSE) |
| **[react-icons](https://www.npmjs.com/package/react-icons)** |  ^4.10.1 | [MIT](https://github.com/react-icons/react-icons/blob/master/LICENSE) |
| **[typescript](https://www.npmjs.com/package/typescript)** |  ^5.1.3 | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| **[prettier](https://www.npmjs.com/package/prettier)** |  ^3.0.3 | [MIT](https://github.com/prettier/prettier/blob/main/LICENSE) |
| **[vite-tsconfig-paths](https://www.npmjs.com/package/vite-tsconfig-paths)** | ^4.2.1 | [MIT](https://github.com/aleclarson/vite-tsconfig-paths/blob/master/LICENSE) |
| **[vitest](https://www.npmjs.com/package/vitest)** |  ^0.34.6 | [MIT](https://github.com/vitest-dev/vitest/blob/main/LICENSE) |

