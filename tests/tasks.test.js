import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Must set env var before any of our modules are imported so storage.js
// picks up the test directory when functions are first called.
const TEST_DIR = join(tmpdir(), `task-manager-test-${Date.now()}`);
process.env.TASK_MANAGER_DATA_DIR = TEST_DIR;
mkdirSync(TEST_DIR, { recursive: true });

import {
  addTask,
  listTasks,
  completeTask,
  deleteTask,
  editTask,
  searchTasks,
  clearCompleted,
  getAllTasks,
  VALID_PRIORITIES,
  sortTasks,
} from '../src/tasks.js';

function resetTasks() {
  const file = join(TEST_DIR, 'tasks.json');
  if (existsSync(file)) unlinkSync(file);
}

// ── VALID_PRIORITIES ──────────────────────────────────────────────────────────

test('VALID_PRIORITIES contains high, medium, low', () => {
  assert.deepEqual(VALID_PRIORITIES, ['high', 'medium', 'low']);
});

// ── addTask ───────────────────────────────────────────────────────────────────

test('addTask creates a task with default medium priority', () => {
  resetTasks();
  const task = addTask('Buy groceries');
  assert.equal(task.id, 1);
  assert.equal(task.title, 'Buy groceries');
  assert.equal(task.priority, 'medium');
  assert.equal(task.completed, false);
  assert.equal(task.completedAt, null);
  assert.ok(task.createdAt);
});

test('addTask assigns sequential IDs', () => {
  resetTasks();
  const t1 = addTask('Task one');
  const t2 = addTask('Task two');
  const t3 = addTask('Task three');
  assert.equal(t1.id, 1);
  assert.equal(t2.id, 2);
  assert.equal(t3.id, 3);
});

test('addTask respects explicit priority', () => {
  resetTasks();
  const task = addTask('Urgent task', 'high');
  assert.equal(task.priority, 'high');
});

test('addTask trims whitespace from title', () => {
  resetTasks();
  const task = addTask('  Trim me  ');
  assert.equal(task.title, 'Trim me');
});

test('addTask throws on invalid priority', () => {
  resetTasks();
  assert.throws(() => addTask('Test', 'urgent'), /Invalid priority/);
});

test('addTask throws on empty title', () => {
  resetTasks();
  assert.throws(() => addTask('   '), /empty/);
});

// ── listTasks ─────────────────────────────────────────────────────────────────

test('listTasks returns all tasks sorted', () => {
  resetTasks();
  addTask('Low task', 'low');
  addTask('High task', 'high');
  addTask('Medium task', 'medium');
  const tasks = listTasks();
  assert.equal(tasks.length, 3);
  // high priority first (incomplete first, then sorted by priority)
  assert.equal(tasks[0].priority, 'high');
  assert.equal(tasks[1].priority, 'medium');
  assert.equal(tasks[2].priority, 'low');
});

test('listTasks filter:pending excludes completed tasks', () => {
  resetTasks();
  addTask('Task A');
  addTask('Task B');
  completeTask(1);
  const pending = listTasks({ filter: 'pending' });
  assert.equal(pending.length, 1);
  assert.equal(pending[0].id, 2);
});

test('listTasks filter:completed returns only completed tasks', () => {
  resetTasks();
  addTask('Task A');
  addTask('Task B');
  completeTask(1);
  const done = listTasks({ filter: 'completed' });
  assert.equal(done.length, 1);
  assert.equal(done[0].id, 1);
});

test('listTasks priority filter returns matching tasks', () => {
  resetTasks();
  addTask('High task', 'high');
  addTask('Low task', 'low');
  const highs = listTasks({ priority: 'high' });
  assert.equal(highs.length, 1);
  assert.equal(highs[0].priority, 'high');
});

// ── completeTask ──────────────────────────────────────────────────────────────

test('completeTask marks a task completed', () => {
  resetTasks();
  addTask('Finish report');
  const task = completeTask(1);
  assert.equal(task.completed, true);
  assert.ok(task.completedAt);
});

test('completeTask throws on unknown id', () => {
  resetTasks();
  assert.throws(() => completeTask(999), /not found/);
});

test('completeTask throws if already completed', () => {
  resetTasks();
  addTask('Already done');
  completeTask(1);
  assert.throws(() => completeTask(1), /already completed/);
});

// ── deleteTask ────────────────────────────────────────────────────────────────

test('deleteTask removes the task', () => {
  resetTasks();
  addTask('To delete');
  deleteTask(1);
  assert.equal(getAllTasks().length, 0);
});

test('deleteTask returns the deleted task', () => {
  resetTasks();
  addTask('Gone task');
  const task = deleteTask(1);
  assert.equal(task.title, 'Gone task');
});

test('deleteTask throws on unknown id', () => {
  resetTasks();
  assert.throws(() => deleteTask(42), /not found/);
});

// ── editTask ──────────────────────────────────────────────────────────────────

test('editTask updates the title', () => {
  resetTasks();
  addTask('Old title');
  const task = editTask(1, { title: 'New title' });
  assert.equal(task.title, 'New title');
});

test('editTask updates the priority', () => {
  resetTasks();
  addTask('Some task', 'low');
  const task = editTask(1, { priority: 'high' });
  assert.equal(task.priority, 'high');
});

test('editTask throws if nothing to update', () => {
  resetTasks();
  addTask('Task');
  assert.throws(() => editTask(1, {}), /Provide at least/);
});

test('editTask throws on invalid priority', () => {
  resetTasks();
  addTask('Task');
  assert.throws(() => editTask(1, { priority: 'critical' }), /Invalid priority/);
});

test('editTask throws on unknown id', () => {
  resetTasks();
  assert.throws(() => editTask(99, { title: 'x' }), /not found/);
});

// ── searchTasks ───────────────────────────────────────────────────────────────

test('searchTasks finds matching tasks case-insensitively', () => {
  resetTasks();
  addTask('Buy Milk');
  addTask('Buy Eggs');
  addTask('Walk the dog');
  const results = searchTasks('buy');
  assert.equal(results.length, 2);
});

test('searchTasks returns empty array for no matches', () => {
  resetTasks();
  addTask('Unrelated task');
  assert.equal(searchTasks('xyz').length, 0);
});

// ── clearCompleted ────────────────────────────────────────────────────────────

test('clearCompleted removes completed tasks and returns count', () => {
  resetTasks();
  addTask('Keep me');
  addTask('Delete me');
  addTask('Also delete');
  completeTask(2);
  completeTask(3);
  const count = clearCompleted();
  assert.equal(count, 2);
  const remaining = getAllTasks();
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].title, 'Keep me');
});

test('clearCompleted returns 0 when no completed tasks', () => {
  resetTasks();
  addTask('Pending task');
  assert.equal(clearCompleted(), 0);
});

// ── sortTasks ─────────────────────────────────────────────────────────────────

test('sortTasks puts incomplete tasks before completed ones', () => {
  const tasks = [
    { id: 1, priority: 'low', completed: true },
    { id: 2, priority: 'low', completed: false },
  ];
  const sorted = sortTasks(tasks);
  assert.equal(sorted[0].completed, false);
  assert.equal(sorted[1].completed, true);
});

test('sortTasks orders by priority within same completion status', () => {
  const tasks = [
    { id: 1, priority: 'low', completed: false },
    { id: 2, priority: 'high', completed: false },
    { id: 3, priority: 'medium', completed: false },
  ];
  const sorted = sortTasks(tasks);
  assert.equal(sorted[0].priority, 'high');
  assert.equal(sorted[1].priority, 'medium');
  assert.equal(sorted[2].priority, 'low');
});

// ── cleanup ───────────────────────────────────────────────────────────────────

process.on('exit', () => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
});
