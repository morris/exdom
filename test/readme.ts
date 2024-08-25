import {
  CustomEventElement,
  qsr,
  reconcile,
  requestAnimationFrameOnce,
  setText,
  setValue,
  TypedCustomEvent,
} from '../src/exdom.js';

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
    // Emit action event (handled somewhere up the DOM)
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
