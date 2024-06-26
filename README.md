# exdom

Essential DOM utilities.

- Query selector shortcuts
- Soft HTML, text, attribute, and input value setters
- Reconciliation
- Type-safe DOM event management

Inspired by learnings from [VANILLA TODO](https://github.com/morris/vanilla-todo),
a case study on viable techniques for vanilla web development.

## Installation

Via npm:

```sh
npm install exdom
```

When not using a bundler, the following additional setup helps:

```ts
// src/exdom.js or src/exdom.ts
export * from 'https://cdn.jsdelivr.net/npm/exdom@1.0.1/dist/exdom.min.js';

// src/exdom.d.ts
declare module 'https://cdn.jsdelivr.net/npm/exdom@1.0.1/dist/exdom.min.js' {
  export * from 'exdom';
}

// src/app.js or src/app.ts
import { ... } from './exdom.js';

// ...
```

## Usage

See **[API reference](https://morris.github.io/exdom)**

## Tests

- `npx playwright install` (once)
- `npm test`
