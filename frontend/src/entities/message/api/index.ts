import { api } from "@shared/api/axios";
import type { Message, MessageCreatePayload, ConversationParticipant } from "../model/types";

export async function getTaskMessages(
  taskId: number,
  participantProfileId?: number | null,
): Promise<Message[]> {
  const params: Record<string, string | number> = {};
  if (participantProfileId != null) {
    params.participant_profile_id = participantProfileId;
  }
  const { data } = await api.get<Message[]>(`/tasks/${taskId}/messages`, { params });
  return data;
}

export async function sendMessage(
  taskId: number,
  payload: MessageCreatePayload,
): Promise<Message> {
  const { data } = await api.post<Message>(`/tasks/${taskId}/messages`, payload);
  return data;
}

export async function getConversationParticipants(
  taskId: number,
): Promise<ConversationParticipant[]> {
  const { data } = await api.get<ConversationParticipant[]>(
    `/tasks/${taskId}/messages/participants`,
  );
  return data;
}
