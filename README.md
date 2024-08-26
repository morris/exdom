# exdom

Essential DOM utilities.

- Query selector shortcuts
- Soft HTML, text, attribute, and input value setters
- Reconciliation
- Type-safe DOM event management

Inspired by learnings from
[VANILLA TODO](https://github.com/morris/vanilla-todo), a case study on viable
techniques for vanilla web development.

## Installation

Via npm:

```sh
npm install exdom
```

When not using a bundler, exdom can be imported via CDN:

```ts
// src/exdom.js or src/exdom.ts
export * from 'https://cdn.jsdelivr.net/npm/exdom@1.0.2/dist/exdom.min.js';

// src/exdom.d.ts
declare module 'https://cdn.jsdelivr.net/npm/exdom@1.0.2/dist/exdom.min.js' {
  export * from 'exdom';
}

// src/app.js or src/app.ts
import { ... } from './exdom.js';

// ...
```

## Usage

A very basic to-do app with exdom could look like this (in TypeScript, but
JavaScript is equally possible) and covers most of exdom's
[functions](https://morris.github.io/exdom):

```ts
import {
  CustomEventElement,
  qsr,
  reconcile,
  requestAnimationFrameOnce,
  setText,
  setValue,
  TypedCustomEvent,
} from 'exdom';

// Type-safe custom DOM event details

interface TodoAppEvents {
  addTodoItem: string;
  toggleTodoItem: string;
  todoItem: TodoItemData;
}

interface TodoItemData {
  id: string;
  label: string;
  done: boolean;
}

// Component functions

function TodoApp(el: CustomEventElement<TodoAppEvents>) {
  // Base HTML

  el.innerHTML = /* html */ `
    <h1>To-Do</h1>
    <p>
      <input type="text" name="label">
      <button type="button" class="add">Add</button>
    </p>
    <ul class="items"></ul>
  `;

  // Initial data

  let items: TodoItemData[] = [
    {
      id: crypto.randomUUID(),
      label: 'Hello, world!',
      done: false,
    },
  ];

  // Idempotent update

  function update() {
    // Reconcile todo item components with item list
    reconcile({
      container: qsr(el, '.items'),
      items,
      create: () => TodoItem(document.createElement('li')),
      update: (el, item) =>
        el.dispatchEvent(new TypedCustomEvent('todoItem', { detail: item })),
    });
  }

  // Action handlers

  el.addEventListener('addTodoItem', (e) => {
    const newItem = {
      id: crypto.randomUUID(),
      label: e.detail,
      done: false,
    };

    items = [...items, newItem];

    requestAnimationFrameOnce(update);
  });

  el.addEventListener('toggleTodoItem', (e) => {
    items = items.map((item) =>
      item.id === e.detail ? { ...item, done: !item.done } : item,
    );

    requestAnimationFrameOnce(update);
  });

  // UI Events

  const labelInput = qsr<HTMLInputElement>(el, '[name=label]');

  qsr(el, '.add').addEventListener('click', () => {
    el.dispatchEvent(
      new TypedCustomEvent('addTodoItem', {
        detail: labelInput.value,
        bubbles: true,
      }),
    );
    setValue(labelInput, '');
  });

  update(); // Initial update

  return el;
}

function TodoItem(el: CustomEventElement<TodoAppEvents>) {
  el.innerHTML = /* html */ `
    <input type="checkbox">
    <label></label>
  `;

  let data: TodoItemData;

  function update() {
    setText(qsr(el, 'label'), data.label);
    setValue(qsr(el, '[type=checkbox]'), data.done);
  }

  el.addEventListener('todoItem', (e) => {
    data = e.detail;
    requestAnimationFrameOnce(update);
  });

  qsr(el, '[type=checkbox]').addEventListener('click', () => {
    el.dispatchEvent(
      new TypedCustomEvent('toggleTodoItem', {
        detail: data.id,
        bubbles: true,
      }),
    );
  });

  return el;
}

// Mount to document

TodoApp(qsr(document, '#app'));
```

See also **[API reference](https://morris.github.io/exdom)**

## Tests

- `npx playwright install` (once)
- `npm test`
