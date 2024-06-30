import {
  CustomEventElement,
  emit,
  getValue,
  nextFrame,
  qsr,
  reconcile,
  send,
  setText,
  setValue,
} from '../src/index.js';

// Type-safe custom DOM events

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
    <h1>Todo</h1>
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

  // Action handlers

  el.addEventListener('addTodoItem', (e) => {
    const newItem = {
      id: crypto.randomUUID(),
      label: e.detail,
      done: false,
    };

    items = [...items, newItem];

    nextFrame(update);
  });

  el.addEventListener('toggleTodoItem', (e) => {
    items = items.map((item) =>
      item.id === e.detail ? { ...item, done: !item.done } : item,
    );

    nextFrame(update);
  });

  // UI Events

  const labelInput = qsr<HTMLInputElement>(el, '[name=label]');

  qsr(el, '.add').addEventListener('click', () => {
    emit<TodoAppEvents>(el, 'addTodoItem', getValue(labelInput) as string);
    setValue(labelInput, '');
  });

  // Idempotent update

  function update() {
    // Reconcile todo item components with item list
    reconcile({
      container: qsr(el, '.items'),
      items: items,
      create: () => TodoItem(document.createElement('li')),
      update: (el, item) => send<TodoAppEvents>(el, 'todoItem', item),
    });
  }

  update(); // Initial update

  return el;
}

function TodoItem(el: CustomEventElement<TodoAppEvents>) {
  el.innerHTML = /* html */ `
    <input type="checkbox">
    <label></label>
  `;

  let data: TodoItemData;

  el.addEventListener('todoItem', (e) => {
    data = e.detail;
    nextFrame(update);
  });

  qsr(el, '[type=checkbox]').addEventListener('click', () => {
    // Emit action event (handled somewhere up the DOM)
    emit<TodoAppEvents>(el, 'toggleTodoItem', data.id);
  });

  function update() {
    setText(qsr(el, 'label'), data.label);
    setValue(qsr(el, '[type=checkbox]'), data.done);
  }

  return el;
}

// Mount to document

TodoApp(qsr(document, '#app'));
