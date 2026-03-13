# Agent ExecutionMeta 표시 범위

**작성일**: 2026-03-13

---

## 현재 동작

- `ExecutionMeta`(success, toolCallCount, analyticsCallCount, executionTimeMs, errors)는 **새로 Agent를 실행한 결과에서만** 메타데이터 카드로 표시된다.
- **이전 대화 이력을 로드할 때는 표시되지 않는다.**

## 이유

- 서버의 `MessageResponse`에는 `content`, `role`, `createdAt` 등 메시지 본문 필드만 존재하며, 실행 메타데이터 필드(`toolCallCount`, `executionTimeMs` 등)가 포함되어 있지 않다.
- `AgentExecutionResult`는 `POST /api/v1/agent/run` 응답에서만 반환되며, `GET /api/v1/agent/sessions/{sessionId}/messages` 응답에는 포함되지 않는다.

## 향후 개선

- API에 메시지별 실행 메타데이터가 포함되면(`MessageResponse`에 `executionMeta` 필드 추가), 이력 로드 시에도 메타데이터 카드를 표시할 수 있다.
- 이 경우 `loadSessionMessages`의 `DisplayMessage` 매핑 로직에서 `executionMeta` 필드를 함께 매핑하면 된다.
