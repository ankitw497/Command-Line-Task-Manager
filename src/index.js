#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
} from './tasks.js';
import { buildTable, printStats, highlightMatch } from './display.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

function handleError(err) {
  console.error(chalk.red('Error: ') + err.message);
  process.exit(1);
}

program
  .name('task')
  .description('A simple and powerful command-line task manager')
  .version(pkg.version, '-V, --version', 'output the current version');

// ── add ──────────────────────────────────────────────────────────────────────

program
  .command('add <title>')
  .description('Add a new task')
  .option('-p, --priority <level>', `Priority: ${VALID_PRIORITIES.join(' | ')}`, 'medium')
  .action((title, opts) => {
    try {
      const task = addTask(title, opts.priority.toLowerCase());
      console.log(chalk.green(`✔ Added task #${task.id}:`) + ' ' + task.title);
    } catch (err) {
      handleError(err);
    }
  });

// ── list ─────────────────────────────────────────────────────────────────────

program
  .command('list')
  .alias('ls')
  .description('List all tasks')
  .option('-f, --filter <status>', 'Filter: completed | pending')
  .option('-p, --priority <level>', `Filter by priority: ${VALID_PRIORITIES.join(' | ')}`)
  .action((opts) => {
    try {
      const tasks = listTasks({ filter: opts.filter, priority: opts.priority });
      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks found.'));
        return;
      }
      console.log(buildTable(tasks).toString());
      console.log(chalk.dim(`  ${tasks.length} task(s)`));
    } catch (err) {
      handleError(err);
    }
  });

// ── complete ──────────────────────────────────────────────────────────────────

program
  .command('complete <id>')
  .alias('done')
  .description('Mark a task as completed')
  .action((id) => {
    try {
      const task = completeTask(parseInt(id, 10));
      console.log(chalk.green(`✔ Completed task #${task.id}:`) + ' ' + task.title);
    } catch (err) {
      handleError(err);
    }
  });

// ── delete ────────────────────────────────────────────────────────────────────

program
  .command('delete <id>')
  .alias('rm')
  .description('Delete a task permanently')
  .action((id) => {
    try {
      const task = deleteTask(parseInt(id, 10));
      console.log(chalk.red(`✖ Deleted task #${task.id}:`) + ' ' + task.title);
    } catch (err) {
      handleError(err);
    }
  });

// ── edit ──────────────────────────────────────────────────────────────────────

program
  .command('edit <id>')
  .description('Edit a task title or priority')
  .option('-t, --title <title>', 'New title')
  .option('-p, --priority <level>', `New priority: ${VALID_PRIORITIES.join(' | ')}`)
  .action((id, opts) => {
    try {
      const task = editTask(parseInt(id, 10), { title: opts.title, priority: opts.priority });
      console.log(chalk.blue(`✎ Updated task #${task.id}:`) + ' ' + task.title);
    } catch (err) {
      handleError(err);
    }
  });

// ── search ────────────────────────────────────────────────────────────────────

program
  .command('search <keyword>')
  .description('Search tasks by keyword')
  .action((keyword) => {
    try {
      const tasks = searchTasks(keyword);
      if (tasks.length === 0) {
        console.log(chalk.yellow(`No tasks match "${keyword}".`));
        return;
      }
      const table = buildTable(tasks, (task) => {
        const highlighted = highlightMatch(task.title, keyword);
        return task.completed ? chalk.gray.strikethrough(highlighted) : highlighted;
      });
      console.log(table.toString());
      console.log(chalk.dim(`  ${tasks.length} match(es) for "${chalk.cyan(keyword)}"`));
    } catch (err) {
      handleError(err);
    }
  });

// ── stats ─────────────────────────────────────────────────────────────────────

program
  .command('stats')
  .description('Show task statistics and progress')
  .action(() => {
    try {
      printStats(getAllTasks());
    } catch (err) {
      handleError(err);
    }
  });

// ── clear ─────────────────────────────────────────────────────────────────────

program
  .command('clear')
  .description('Remove all completed tasks')
  .action(() => {
    try {
      const count = clearCompleted();
      if (count === 0) {
        console.log(chalk.yellow('No completed tasks to clear.'));
      } else {
        console.log(chalk.green(`✔ Cleared ${count} completed task(s).`));
      }
    } catch (err) {
      handleError(err);
    }
  });

program.parse(process.argv);
