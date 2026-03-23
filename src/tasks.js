import { loadTasks, saveTasks } from './storage.js';
import { PRIORITY_ORDER } from './display.js';

export const VALID_PRIORITIES = ['high', 'medium', 'low'];

function nextId(tasks) {
  return tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pd !== 0) return pd;
    return a.id - b.id;
  });
}

export function addTask(title, priority = 'medium') {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority "${priority}". Use: ${VALID_PRIORITIES.join(', ')}`);
  }
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Task title cannot be empty.');

  const tasks = loadTasks();
  const task = {
    id: nextId(tasks),
    title: trimmed,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function listTasks({ filter, priority } = {}) {
  let tasks = loadTasks();
  if (filter === 'completed') tasks = tasks.filter((t) => t.completed);
  else if (filter === 'pending') tasks = tasks.filter((t) => !t.completed);
  if (priority) tasks = tasks.filter((t) => t.priority === priority);
  return sortTasks(tasks);
}

export function completeTask(id) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task #${id} not found.`);
  if (task.completed) throw new Error(`Task #${id} is already completed.`);
  task.completed = true;
  task.completedAt = new Date().toISOString();
  saveTasks(tasks);
  return task;
}

export function deleteTask(id) {
  const tasks = loadTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Task #${id} not found.`);
  const [task] = tasks.splice(idx, 1);
  saveTasks(tasks);
  return task;
}

export function editTask(id, { title, priority } = {}) {
  if (!title && !priority) {
    throw new Error('Provide at least --title or --priority to edit.');
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority "${priority}". Use: ${VALID_PRIORITIES.join(', ')}`);
  }
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task #${id} not found.`);
  if (title) task.title = title.trim();
  if (priority) task.priority = priority;
  saveTasks(tasks);
  return task;
}

export function searchTasks(keyword) {
  const kw = keyword.toLowerCase();
  return sortTasks(loadTasks().filter((t) => t.title.toLowerCase().includes(kw)));
}

export function clearCompleted() {
  const tasks = loadTasks();
  const remaining = tasks.filter((t) => !t.completed);
  const count = tasks.length - remaining.length;
  saveTasks(remaining);
  return count;
}

export function getAllTasks() {
  return loadTasks();
}
