---
name: vue-testing-best-practices
description: "Vue 3 and Inertia.js frontend test design and review using Vitest and @vue/test-utils. Activates when writing or reviewing frontend unit tests, component tests, composable tests, mocking Inertia links/forms/pages, or running Vitest."
license: MIT
metadata:
  author: ant-gravity
---

# Vue 3 Frontend Testing Best Practices

This skill provides rules, patterns, and best practices for writing frontend unit and component tests in Vue 3 and Inertia.js using **Vitest** and **`@vue/test-utils`**.

## Core Philosophy

- **Test User-Visible Behavior, Not Implementation Details**: Assert that text renders, classes change, buttons emit events, and forms submit data.
- **Component Isolation**: Mount components using `mount` or `shallowMount` with `@vue/test-utils` in a simulated `happy-dom` environment.
- **Isolate Inertia & Router**: Stub or mock Inertia features (`<Link>`, `useForm`, `usePage`, `router`) so frontend tests run instantly without requiring a live Laravel server.
- **Targeted Test Execution**: Run targeted tests with file paths (`npx vitest run path/to/Test.test.js`) or specific filters (`-t "pattern"`) to ensure sub-second feedback.

## Rule Index

| Concern | Read |
| --- | --- |
| Component mounting, props, events, user interactions | [`rules/component-testing.md`](rules/component-testing.md) |
| Mocking Inertia.js (`<Link>`, `useForm`, `usePage`, `router`) | [`rules/inertia-mocking.md`](rules/inertia-mocking.md) |
| Running tests, CLI flags, targeting specific files | [`rules/running-tests.md`](rules/running-tests.md) |

## Quick Commands

- Run a specific frontend test:
  ```bash
  npx vitest run resources/js/lib/utils.test.js
  ```
- Run tests matching a component name:
  ```bash
  npx vitest run -t "SurahCard"
  ```
