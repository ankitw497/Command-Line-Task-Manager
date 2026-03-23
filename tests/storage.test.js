import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, existsSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Use a separate test directory to avoid conflicts with tasks.test.js
const TEST_DIR = join(tmpdir(), `storage-test-${Date.now()}`);
process.env.TASK_MANAGER_DATA_DIR = TEST_DIR;
mkdirSync(TEST_DIR, { recursive: true });

import { loadTasks, saveTasks } from '../src/storage.js';

function resetFile() {
  const file = join(TEST_DIR, 'tasks.json');
  if (existsSync(file)) unlinkSync(file);
}

test('loadTasks returns empty array when file does not exist', () => {
  resetFile();
  assert.deepEqual(loadTasks(), []);
});

test('saveTasks writes tasks to disk', () => {
  resetFile();
  saveTasks([{ id: 1, title: 'Test', priority: 'medium', completed: false }]);
  assert.ok(existsSync(join(TEST_DIR, 'tasks.json')));
});

test('loadTasks reads back what saveTasks wrote', () => {
  resetFile();
  const tasks = [
    { id: 1, title: 'First', priority: 'high', completed: false, createdAt: '2024-01-01T00:00:00.000Z', completedAt: null },
    { id: 2, title: 'Second', priority: 'low', completed: true, createdAt: '2024-01-02T00:00:00.000Z', completedAt: '2024-01-03T00:00:00.000Z' },
  ];
  saveTasks(tasks);
  assert.deepEqual(loadTasks(), tasks);
});

test('saveTasks writes valid pretty-printed JSON', () => {
  resetFile();
  saveTasks([{ id: 1, title: 'JSON check' }]);
  const raw = readFileSync(join(TEST_DIR, 'tasks.json'), 'utf-8');
  assert.doesNotThrow(() => JSON.parse(raw));
  assert.ok(raw.includes('\n'), 'JSON should be pretty-printed');
});

test('loadTasks returns empty array on corrupted JSON', () => {
  writeFileSync(join(TEST_DIR, 'tasks.json'), '{ broken json', 'utf-8');
  assert.deepEqual(loadTasks(), []);
});

test('saveTasks creates the data directory if it does not exist', () => {
  const subDir = join(TEST_DIR, 'nested', 'deep');
  const prevDir = process.env.TASK_MANAGER_DATA_DIR;
  process.env.TASK_MANAGER_DATA_DIR = subDir;
  saveTasks([{ id: 1, title: 'Dir test' }]);
  assert.ok(existsSync(join(subDir, 'tasks.json')));
  process.env.TASK_MANAGER_DATA_DIR = prevDir;
  rmSync(join(TEST_DIR, 'nested'), { recursive: true, force: true });
});

test('saveTasks persists multiple tasks correctly', () => {
  resetFile();
  const tasks = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Task ${i + 1}`,
    priority: ['high', 'medium', 'low', 'high', 'medium'][i],
    completed: i % 2 === 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
  }));
  saveTasks(tasks);
  assert.equal(loadTasks().length, 5);
});

process.on('exit', () => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
});
