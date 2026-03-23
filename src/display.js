import chalk from 'chalk';
import Table from 'cli-table3';

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export const PRIORITY_LABEL = {
  high: chalk.red.bold('HIGH'),
  medium: chalk.yellow.bold('MED'),
  low: chalk.green.bold('LOW'),
};

export const PRIORITY_DOT = {
  high: chalk.red('●'),
  medium: chalk.yellow('●'),
  low: chalk.green('●'),
};

export function formatDate(iso) {
  if (!iso) return chalk.gray('—');
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTitle(task) {
  return task.completed ? chalk.gray.strikethrough(task.title) : task.title;
}

export function statusIcon(task) {
  return task.completed ? chalk.green('✔') : chalk.gray('○');
}

export function highlightMatch(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'gi'), (m) => chalk.cyan.bold(m));
}

/**
 * Build a formatted table for the given tasks.
 * @param {object[]} tasks
 * @param {(task: object) => string} [titleFn] Optional override for title cell rendering
 */
export function buildTable(tasks, titleFn = null) {
  const table = new Table({
    head: [
      chalk.cyan.bold('ID'),
      chalk.cyan.bold(''),
      chalk.cyan.bold('Title'),
      chalk.cyan.bold('Priority'),
      chalk.cyan.bold('Created'),
      chalk.cyan.bold('Completed'),
    ],
    colWidths: [5, 3, 38, 10, 20, 20],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const task of tasks) {
    const title = titleFn ? titleFn(task) : formatTitle(task);
    table.push([
      chalk.dim(String(task.id)),
      statusIcon(task),
      title,
      `${PRIORITY_DOT[task.priority]} ${PRIORITY_LABEL[task.priority]}`,
      chalk.dim(formatDate(task.createdAt)),
      chalk.dim(formatDate(task.completedAt)),
    ]);
  }

  return table;
}

export function printStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const BAR_WIDTH = 30;
  const filled = Math.round((pct / 100) * BAR_WIDTH);
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(BAR_WIDTH - filled));

  console.log('');
  console.log(chalk.bold('  Task Statistics'));
  console.log(chalk.gray('  ─────────────────────────────────'));
  console.log(`  Total     : ${chalk.bold(total)}`);
  console.log(`  Completed : ${chalk.green.bold(completed)}`);
  console.log(`  Pending   : ${chalk.yellow.bold(pending)}`);
  console.log(`  Progress  : [${bar}] ${chalk.bold(pct + '%')}`);
  console.log('');
}
