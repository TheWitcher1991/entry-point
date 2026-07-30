"use client";

import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  $chatDrawerOpen,
  $chatContext,
  closeChatDrawer,
} from "../model/stores";
import { Chat } from "./Chat";
import { MessageSquare } from "@shared/ui/Icons";
import { getTask } from "@entities/task";

/** Drawer — рендерится в layout, открывается через effector store. */
export function ChatDrawer() {
  const isOpen = useUnit($chatDrawerOpen);
  const context = useUnit($chatContext);
  const [taskTitle, setTaskTitle] = useState<string | null>(null);

  // Fetch task title for the header
  const { data: task } = useQuery({
    queryKey: ["task", context.taskId],
    queryFn: () => getTask(context.taskId!),
    enabled: context.taskId != null,
  });

  useEffect(() => {
    if (task?.title) {
      setTaskTitle(task.title);
    }
  }, [task]);

  // Reset title when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTaskTitle(null);
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeChatDrawer()}>
      <SheetContent side="right" className="w-full sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare size={16} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-[14px] font-semibold font-display truncate">
                {taskTitle || "Чат"}
              </SheetTitle>
              {taskTitle && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Обсуждение задачи
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {context.taskId ? (
            <Chat taskId={context.taskId} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MessageSquare size={40} strokeWidth={1.5} className="text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">
                  Откройте страницу задачи,<br />чтобы начать чат
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
