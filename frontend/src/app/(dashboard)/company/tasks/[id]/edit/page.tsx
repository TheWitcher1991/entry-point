"use client";

import { useParams } from "next/navigation";
import { EditTaskForm } from "@features/task-edit";
import { Header } from "@widgets/header";

export default function EditTaskPage() {
  const params = useParams();
  const taskId = Number(params.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-10 pb-8">
        <EditTaskForm taskId={taskId} />
      </div>
    </div>
  );
}
