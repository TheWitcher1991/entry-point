import type { Task } from "@entities/task";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="p-8">
      <CardContent className="p-0 flex flex-col gap-3">
        <h3 className="text-[20px] font-semibold text-foreground leading-snug text-wrap-pretty">
          {task.title}
        </h3>
        {task.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {task.summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">{task.difficulty}</span>
          <span aria-hidden="true">•</span>
          <span>до {task.deadline}</span>
          {task.participant_count !== undefined && (
            <>
              <span aria-hidden="true">•</span>
              <span className="tabular-nums">{task.participant_count}/{task.participant_limit}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
