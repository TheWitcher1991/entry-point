export interface Message {
  id: number;
  task_id: number;
  sender_id: number;
  sender_first_name: string | null;
  sender_last_name: string | null;
  sender_role: string | null;
  participant_profile_id: number | null;
  text: string;
  created_at: string;
}

export interface MessageCreatePayload {
  text: string;
  participant_profile_id?: number | null;
}

export interface ConversationParticipant {
  id: number;
  first_name: string;
  last_name: string;
}
