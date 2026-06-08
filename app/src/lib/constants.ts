import type { TechProvider, EmergingTechType, SourceType } from "@/types/emerging-tech";

export const PROVIDER_COLORS: Record<TechProvider, string> = {
  OPENAI: "bg-[#10A37F] text-white",
  ANTHROPIC: "bg-[#D97706] text-white",
  GOOGLE: "bg-[#4285F4] text-white",
  META: "bg-[#0668E1] text-white",
  XAI: "bg-black text-white",
};

export const PROVIDER_LABELS: Record<TechProvider, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  META: "Meta",
  XAI: "xAI",
};

// 알 수 없는 provider면 회색 배지 + 원문 문자열로 떨어진다
export function resolveProvider(
  provider: string | null
): { color: string; label: string | null } {
  const key = provider as TechProvider | null;
  const color =
    key && PROVIDER_COLORS[key] ? PROVIDER_COLORS[key] : "bg-gray-500 text-white";
  const label = key && PROVIDER_LABELS[key] ? PROVIDER_LABELS[key] : provider;
  return { color, label };
}

export const UPDATE_TYPE_LABELS: Record<EmergingTechType, string> = {
  MODEL_RELEASE: "Model Release",
  API_UPDATE: "API Update",
  SDK_RELEASE: "SDK Release",
  PRODUCT_LAUNCH: "Product Launch",
  PLATFORM_UPDATE: "Platform Update",
  BLOG_POST: "Blog Post",
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  GITHUB_RELEASE: "GitHub",
  RSS: "RSS",
  WEB_SCRAPING: "Web",
};
