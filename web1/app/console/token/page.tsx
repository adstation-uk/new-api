import { api } from "@/lib/api";
import { TokenClient } from "./token-client";

async function getTokens(page: number, pageSize: number, keyword: string) {
  try {
    const res = await api(
      `/api/token?p=${page - 1}&size=${pageSize}&keyword=${encodeURIComponent(
        keyword,
      )}`,
    );
    const data = await res.json();
    if (data.success) {
      // Handle legacy response structure variations if needed
      if (data.data && Array.isArray(data.data.items)) {
        return {
          items: data.data.items,
          total: data.data.total,
        };
      } else if (Array.isArray(data.data)) {
        return { items: data.data, total: data.data.length };
      }
    }
  } catch (e) {
    console.error("Failed to fetch tokens", e);
  }
  return { items: [], total: 0 };
}

export default async function TokenPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; keyword?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.p || "1");
  const keyword = params.keyword || "";
  const pageSize = 10;

  const { items, total } = await getTokens(page, pageSize, keyword);

  return (
    <TokenClient
      initialTokens={items}
      total={total}
      page={page}
      pageSize={pageSize}
      keyword={keyword}
    />
  );
}
