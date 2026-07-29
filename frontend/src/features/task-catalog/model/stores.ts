import { createStore, createEvent } from "effector";
import type { Task } from "@entities/task";

export const $tasks = createStore<Task[]>([]);
export const $selectedTask = createStore<Task | null>(null);

export const setTasks = createEvent<Task[]>();
export const selectTask = createEvent<Task>();

$tasks.on(setTasks, (_, tasks) => tasks);
$selectedTask.on(selectTask, (_, task) => task);
