import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Read dynamically so tests can override via TASK_MANAGER_DATA_DIR
function getDataDir() {
  return process.env.TASK_MANAGER_DATA_DIR || join(homedir(), '.task-manager');
}

function getTasksFile() {
  return join(getDataDir(), 'tasks.json');
}

export function loadTasks() {
  const file = getTasksFile();
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  const dir = getDataDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(getTasksFile(), JSON.stringify(tasks, null, 2), 'utf-8');
}
