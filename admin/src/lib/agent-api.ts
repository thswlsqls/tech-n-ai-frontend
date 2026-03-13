import { authFetch, parseResponse, parseVoidResponse } from "@/lib/auth-fetch";
import { toQueryString } from "@/lib/utils";
import type {
  AgentRunRequest,
  AgentExecutionResult,
  SessionResponse,
  SessionListResponse,
  MessageListResponse,
  PaginationParams,
} from "@/types/agent";

const BASE = "/api/v1/agent";

export async function runAgent(
  req: AgentRunRequest
): Promise<AgentExecutionResult> {
  const res = await authFetch(`${BASE}/run`, {
    method: "POST",
    body: JSON.stringify(req),
  });
  return parseResponse<AgentExecutionResult>(res);
}

export async function fetchAgentSessions(
  params: PaginationParams = {}
): Promise<SessionListResponse> {
  const res = await authFetch(`${BASE}/sessions${toQueryString(params)}`);
  return parseResponse<SessionListResponse>(res);
}

export async function fetchAgentSessionDetail(
  sessionId: string
): Promise<SessionResponse> {
  const res = await authFetch(
    `${BASE}/sessions/${encodeURIComponent(sessionId)}`
  );
  return parseResponse<SessionResponse>(res);
}

export async function fetchAgentSessionMessages(
  sessionId: string,
  params: PaginationParams = {}
): Promise<MessageListResponse> {
  const res = await authFetch(
    `${BASE}/sessions/${encodeURIComponent(sessionId)}/messages${toQueryString(params)}`
  );
  return parseResponse<MessageListResponse>(res);
}

export async function deleteAgentSession(sessionId: string): Promise<void> {
  const res = await authFetch(
    `${BASE}/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );
  return parseVoidResponse(res);
}
