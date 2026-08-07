"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getAuthToken,
  getEnquiryMessages,
  sendEnquiryMessage,
  type Enquiry,
  type EnquiryMessage,
  type User,
} from "@/lib/api";

type EnquiryChatProps = {
  enquiry: Enquiry;
  currentUser: User;
  onClose: () => void;
};

function getParticipantName(enquiry: Enquiry, currentUser: User) {
  const participant = currentUser.role.toUpperCase() === "VENDOR" ? enquiry.planner : enquiry.vendor;
  return participant?.name || [participant?.firstName, participant?.lastName].filter(Boolean).join(" ") || participant?.email || "your contact";
}

function messageList(value: EnquiryMessage[] | { data?: EnquiryMessage[]; messages?: EnquiryMessage[] } | null) {
  return Array.isArray(value) ? value : value?.messages ?? value?.data ?? [];
}

export function EnquiryChat({ enquiry, currentUser, onClose }: EnquiryChatProps) {
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const name = getParticipantName(enquiry, currentUser);
  const roomId = enquiry.chatRoom?.id ?? enquiry.id;

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const result = await getEnquiryMessages(roomId, getAuthToken() ?? undefined);
      if (!active) return;
      if (result.error) setError(result.error);
      else setMessages(messageList(result.data));
      setIsLoading(false);
    }
    load();
    return () => { active = false; };
  }, [roomId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setIsSending(true);
    setError(null);
    const result = await sendEnquiryMessage(roomId, body, getAuthToken() ?? undefined);
    setIsSending(false);
    if (result.error || !result.data) {
      setError(result.error ?? "Unable to send your message.");
      return;
    }
    setMessages((current) => [...current, result.data as EnquiryMessage]);
    setDraft("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="chat-title">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-sm font-medium text-blue-600">Enquiry conversation</p>
            <h2 id="chat-title" className="mt-1 text-xl font-semibold text-slate-950">Chat with {name}</h2>
            <p className="mt-1 text-sm text-slate-500">{enquiry.eventType} · {enquiry.eventDate}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close chat">✕</button>
        </div>

        <div className="min-h-56 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
          {enquiry.specialNotes ? <div className="max-w-[85%] rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm"><p className="mb-1 text-xs font-semibold text-slate-500">Booking request</p>{enquiry.specialNotes}</div> : null}
          {isLoading ? <p className="text-sm text-slate-500">Loading messages…</p> : null}
          {!isLoading && messages.length === 0 ? <p className="text-sm text-slate-500">No messages yet. Start the conversation below.</p> : null}
          {messages.map((message) => {
            const mine = message.senderId === currentUser.id || message.sender?.id === currentUser.id;
            return <div key={message.id} className={mine ? "ml-auto max-w-[85%] rounded-2xl bg-blue-600 p-3 text-sm text-white" : "max-w-[85%] rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm"}>{message.content}</div>;
          })}
        </div>

        <form onSubmit={submit} className="border-t border-slate-100 p-4">
          {error ? <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p> : null}
          <div className="flex gap-3">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            <button disabled={isSending || !draft.trim()} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300">{isSending ? "Sending…" : "Send"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
