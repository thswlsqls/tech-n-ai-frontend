import type { PageData } from "@/types/common";
export type { PageData };

export type MessageRole = "USER" | "ASSISTANT";

export interface AgentRunRequest {
  goal: string;
  sessionId?: string;
}

export interface AgentExecutionResult {
  success: boolean;
  summary: string;
  sessionId: string;
  toolCallCount: number;
  analyticsCallCount: number;
  executionTimeMs: number;
  errors: string[];
}

export interface SessionResponse {
  sessionId: string;
  title: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  isActive: boolean;
}

export interface MessageResponse {
  messageId: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokenCount?: number;
  sequenceNumber: number;
  createdAt: string;
}

export interface SessionListResponse {
  data: PageData<SessionResponse>;
}

export interface MessageListResponse {
  data: PageData<MessageResponse>;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export type ExecutionMeta = Pick<
  AgentExecutionResult,
  "success" | "toolCallCount" | "analyticsCallCount" | "executionTimeMs" | "errors"
>;

export interface DisplayMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  executionMeta?: ExecutionMeta;
  failed?: boolean;
}
