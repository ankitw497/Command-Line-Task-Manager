# cli-task-manager

A simple and powerful command-line task manager. Add, list, complete, edit, search, and track tasks right from your terminal — no account, no cloud, just a local JSON file in your home directory.

[![CI](https://github.com/ankitw497/Command-Line-Task-Manager/actions/workflows/ci.yml/badge.svg)](https://github.com/ankitw497/Command-Line-Task-Manager/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40ankitw497%2Ftask-manager.svg)](https://www.npmjs.com/package/@ankitw497/task-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

```bash
npm install -g @ankitw497/task-manager
```

> Requires Node.js >= 18

Once installed, the `task` command is available globally.

---

## Quick Start

```bash
task add "Buy groceries"
task add "Submit report" --priority high
task list
task complete 1
task stats
```

---

## Commands

### `task add <title>`

Add a new task.

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--priority <level>` | `-p` | `high`, `medium`, or `low` | `medium` |

```bash
task add "Read documentation"
task add "Fix critical bug" -p high
task add "Clean up comments" -p low
```

---

### `task list` / `task ls`

List all tasks in a formatted table, sorted by status → priority → ID.

| Option | Alias | Description |
|--------|-------|-------------|
| `--filter <status>` | `-f` | `completed` or `pending` |
| `--priority <level>` | `-p` | `high`, `medium`, or `low` |

```bash
task list
task ls
task list --filter pending
task list --filter completed
task list --priority high
```

---

### `task complete <id>` / `task done <id>`

Mark a task as completed.

```bash
task complete 3
task done 3
```

---

### `task edit <id>`

Edit a task's title or priority.

| Option | Alias | Description |
|--------|-------|-------------|
| `--title <title>` | `-t` | New title |
| `--priority <level>` | `-p` | New priority |

```bash
task edit 2 --title "Updated title"
task edit 2 --priority high
task edit 2 -t "New title" -p low
```

---

### `task delete <id>` / `task rm <id>`

Permanently delete a task.

```bash
task delete 4
task rm 4
```

---

### `task search <keyword>`

Search tasks by keyword (case-insensitive). Matching text is highlighted.

```bash
task search bug
task search "meeting notes"
```

---

### `task stats`

Show completion statistics with a visual progress bar.

```bash
task stats
```

```
  Task Statistics
  ─────────────────────────────────
  Total     : 8
  Completed : 5
  Pending   : 3
  Progress  : [██████████████████░░░░░░░░░░░░] 63%
```

---

### `task clear`

Remove all completed tasks in one go.

```bash
task clear
```

---

## Data Storage

Tasks are saved to `~/.task-manager/tasks.json`. This file is created automatically on first use and persists across all directories and sessions.

To use a custom location (e.g. for per-project task lists):

```bash
TASK_MANAGER_DATA_DIR=/path/to/dir task list
```

---

## Development

```bash
git clone https://github.com/ankitw497/Command-Line-Task-Manager.git
cd Command-Line-Task-Manager
npm install

# Run the CLI locally
node src/index.js add "Test task"

# Or link it globally for development
npm link
task add "Test task"

# Run tests
npm test
```

### Project Structure

```
src/
  index.js    — CLI entry point (commands + argument parsing)
  tasks.js    — Business logic (add, complete, edit, delete, search …)
  storage.js  — JSON persistence (read/write ~/.task-manager/tasks.json)
  display.js  — Table rendering and output formatting
tests/
  tasks.test.js    — Unit tests for task operations (35 tests)
  storage.test.js  — Unit tests for storage layer
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Open a Pull Request

Please ensure all tests pass (`npm test`) before submitting.

---

## License

MIT © [Ankit Wahane](https://github.com/ankitwahane)
