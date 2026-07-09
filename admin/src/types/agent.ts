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
  chartData: ChartData[];
}

export interface ChartData {
  chartType: "pie" | "bar";
  title: string;
  meta: ChartMeta;
  dataPoints: DataPoint[];
}

export interface ChartMeta {
  groupBy: string;
  startDate: string | null;
  endDate: string | null;
  // 백엔드가 Java long을 전역 Jackson 설정으로 JSON 문자열로 직렬화한다.
  // 렌더링 시 agent-chart.tsx에서 Number()로 변환해 쓴다.
  totalCount: string;
}

export interface DataPoint {
  label: string;
  // totalCount와 같은 이유로 문자열이다(백엔드 long → JSON string).
  value: string;
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
  chartData?: ChartData[];
  failed?: boolean;
}
