import type {
  ApiResponse,
  PageData,
  EmergingTechItem,
  ListParams,
  SearchParams,
} from "@/types/emerging-tech";

const BASE = "/api/v1/emerging-tech";

function toQuery(params: object): string {
  const entries = Object.entries(params as Record<string, unknown>);
  const sp = new URLSearchParams();
  for (const [k, v] of entries) {
    if (v !== undefined && v !== null && v !== "") {
      sp.set(k, String(v));
    }
  }
  const str = sp.toString();
  return str ? `?${str}` : "";
}

// Backend may respond with legacy fields (items/totalCount) or PageData fields (list/totalSize).
// Normalize to PageData<T> format.
interface RawPageResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalPageNumber?: number;
  totalSize?: number;
  totalCount?: number;
  list?: T[];
  items?: T[];
}

function normalizePageData<T>(raw: RawPageResponse<T>): PageData<T> {
  const list = raw.list ?? raw.items ?? [];
  const totalSize = raw.totalSize ?? raw.totalCount ?? 0;
  const totalPageNumber =
    raw.totalPageNumber ?? Math.ceil(totalSize / (raw.pageSize || 1));
  return {
    pageSize: raw.pageSize,
    pageNumber: raw.pageNumber,
    totalPageNumber,
    totalSize,
    list,
  };
}

export async function fetchList(
  params: ListParams = {}
): Promise<PageData<EmergingTechItem>> {
  const res = await fetch(`${BASE}${toQuery(params)}`);
  if (!res.ok) throw new Error(`목록 조회 실패: ${res.status}`);
  const json: ApiResponse<RawPageResponse<EmergingTechItem>> = await res.json();
  return normalizePageData(json.data);
}

export async function fetchDetail(id: string): Promise<EmergingTechItem> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Item not found");
    throw new Error(`상세 조회 실패: ${res.status}`);
  }
  const json: ApiResponse<EmergingTechItem> = await res.json();
  return json.data;
}

export async function fetchSearch(
  params: SearchParams
): Promise<PageData<EmergingTechItem>> {
  const res = await fetch(`${BASE}/search${toQuery(params)}`);
  if (!res.ok) throw new Error(`검색 실패: ${res.status}`);
  const json: ApiResponse<RawPageResponse<EmergingTechItem>> = await res.json();
  return normalizePageData(json.data);
}
