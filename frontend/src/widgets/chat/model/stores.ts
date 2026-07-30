import { createStore, createEvent } from "effector";

/* ── State ── */

export const $chatDrawerOpen = createStore(false);
export const $chatContext = createStore<{
  taskId: number | null;
}>({
  taskId: null,
});

/* ── Events ── */

export const openChatDrawer = createEvent<{ taskId?: number | null }>();
export const closeChatDrawer = createEvent();
export const setChatTaskId = createEvent<number | null>();

/* ── Reducers ── */

$chatDrawerOpen.on(openChatDrawer, () => true).on(closeChatDrawer, () => false);

$chatContext.on(openChatDrawer, (_, payload) => ({
  taskId: payload.taskId ?? null,
}));

$chatContext.on(setChatTaskId, (state, taskId) => ({
  ...state,
  taskId,
}));
