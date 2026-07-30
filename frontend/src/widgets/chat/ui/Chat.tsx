"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { getTaskMessages, sendMessage, getConversationParticipants } from "@entities/message";
import { Send, ChevronDown, MessageSquare } from "@shared/ui/Icons";

interface ChatProps {
  taskId: number;
}

export function Chat({ taskId }: ChatProps) {
  const user = useUnit($user);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [participantDropdownOpen, setParticipantDropdownOpen] = useState(false);

  const isCompany = user?.role === "company";

  // ── Participants (company only) ──
  const { data: participants = [] } = useQuery({
    queryKey: ["conversation-participants", taskId],
    queryFn: () => getConversationParticipants(taskId),
    enabled: isCompany,
  });

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  useEffect(() => {
    if (isCompany && participants.length > 0 && !selectedParticipantId) {
      setSelectedParticipantId(participants[0].id);
    }
  }, [isCompany, participants, selectedParticipantId]);

  // ── Messages ──
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["task-messages", taskId, selectedParticipantId],
    queryFn: () => getTaskMessages(taskId, isCompany ? selectedParticipantId : undefined),
    refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
    mutationFn: (msgText: string) =>
      sendMessage(taskId, {
        text: msgText,
        participant_profile_id: isCompany ? selectedParticipantId : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-messages", taskId] });
      setText("");
    },
  });

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-resize textarea ──
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "0";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  // ── Handlers ──
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Group messages by sender for cleaner display ──
  const groupedMessages = messages.reduce<Array<{ msgs: typeof messages; isMine: boolean; senderName: string | null }>>(
    (acc, msg) => {
      const isMine = msg.sender_id === user?.id;
      const last = acc[acc.length - 1];
      if (last && last.isMine === isMine) {
        last.msgs.push(msg);
      } else {
        acc.push({
          msgs: [msg],
          isMine,
          senderName: msg.sender_first_name
            ? `${msg.sender_first_name} ${msg.sender_last_name ?? ""}`.trim()
            : null,
        });
      }
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-card">
      {/* ── Company: participant selector ── */}
      {isCompany && (
        <div className="px-4 py-3 border-b border-border">
          {participants.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setParticipantDropdownOpen(!participantDropdownOpen)}
                className="w-full flex items-center justify-between h-[38px] px-3 rounded-[12px] bg-muted text-[13px] text-foreground font-medium hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <span className="truncate">
                  {selectedParticipant
                    ? `${selectedParticipant.first_name} ${selectedParticipant.last_name}`
                    : "Выберите участника"}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform duration-150 ${participantDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {participantDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setParticipantDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-[12px] bg-card border border-border shadow-lg py-1 max-h-[200px] overflow-y-auto">
                    {participants.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedParticipantId(p.id);
                          setParticipantDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left text-[13px] hover:bg-muted transition-colors cursor-pointer ${
                          p.id === selectedParticipantId
                            ? "text-primary font-medium bg-primary/5"
                            : "text-foreground"
                        }`}
                      >
                        {p.first_name} {p.last_name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <MessageSquare size={14} strokeWidth={1.5} />
              Нет участников для чата
            </div>
          )}
        </div>
      )}

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-[12px] text-muted-foreground">Загрузка сообщений...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-[240px]">
              <div className="w-12 h-12 rounded-[16px] bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={22} strokeWidth={1.5} className="text-muted-foreground/60" />
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {isCompany
                  ? "Напишите участнику первым"
                  : "Напишите компании — задайте вопросы по задаче"}
              </p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group, gi) => {
            const firstMsg = group.msgs[0];
            return (
              <div
                key={firstMsg.id}
                className={`flex flex-col ${group.isMine ? "items-end" : "items-start"}`}
              >
                {/* Sender label (only for other's messages at start of group) */}
                {!group.isMine && group.senderName && (
                  <span className="text-[11px] font-medium text-muted-foreground mb-1 px-1">
                    {group.senderName}
                  </span>
                )}

                {/* Message bubbles */}
                <div className={`flex flex-col gap-1 max-w-[85%] ${group.isMine ? "items-end" : "items-start"}`}>
                  {group.msgs.map((msg, mi) => (
                    <div key={msg.id} className="flex flex-col">
                      <div
                        className={`px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                          group.isMine
                            ? "bg-primary text-white rounded-[14px] rounded-br-[4px]"
                            : "bg-muted text-foreground rounded-[14px] rounded-bl-[4px]"
                        } ${mi > 0 && group.isMine ? "rounded-tr-[14px]" : ""} ${
                          mi > 0 && !group.isMine ? "rounded-tl-[14px]" : ""
                        }`}
                      >
                        {msg.text}
                      </div>
                      {/* Timestamp under last message in group */}
                      {mi === group.msgs.length - 1 && (
                        <span
                          className={`text-[10px] text-muted-foreground/60 mt-0.5 px-1 ${
                            group.isMine ? "text-right" : "text-left"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать сообщение..."
              rows={1}
              className="w-full min-h-[40px] max-h-[120px] px-3.5 py-2.5 rounded-[14px] bg-muted text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/30 transition-shadow resize-none overflow-y-auto leading-[1.4]"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
            className="shrink-0 w-[40px] h-[40px] inline-flex items-center justify-center rounded-[12px] bg-primary text-white hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Отправить"
          >
            {sendMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
