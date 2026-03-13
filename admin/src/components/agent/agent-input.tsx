"use client";

import { useRef, useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

interface Props {
  onSend: (goal: string) => void;
  disabled?: boolean;
  isSending?: boolean;
}

export function AgentInput({ onSend, disabled, isSending }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled && !isSending;

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="shrink-0 border-t-2 border-black bg-white p-4">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder="Enter a goal for the agent..."
          aria-label="Goal input"
          rows={1}
          className="brutal-border min-h-[48px] max-h-[200px] w-full flex-1 resize-none px-4 py-3 text-base focus:border-[#3B82F6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send goal"
          className="brutal-border brutal-shadow-sm brutal-hover shrink-0 bg-[#3B82F6] p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizontal className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
