import type { Task } from "@entities/task";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article
      style={{
        background: "var(--color-surface, #ffffff)",
        borderRadius: 24,
        padding: 32,
        border: "1px solid var(--color-border, #ececec)",
      }}
    >
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{task.title}</h3>
      <p style={{ color: "var(--color-text-secondary, #6e7478)", marginBottom: 12 }}>
        {task.summary}
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
        <span>{task.company_name}</span>
        <span>•</span>
        <span>{task.difficulty}</span>
        <span>•</span>
        <span>до {task.deadline}</span>
      </div>
    </article>
  );
}
