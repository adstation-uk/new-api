import { api } from "@/lib/api";
import { LogClient } from "./log-client";

async function getLogs(page: number, pageSize: number, keyword: string) {
  try {
    const query = new URLSearchParams({
      p: (page - 1).toString(),
      size: pageSize.toString(),
    });

    // Simple heuristic: map keyword to likely fields if provided
    // For now we map it to token_name as it's a common search target for users
    if (keyword) {
      query.set("token_name", keyword);
    }

    const res = await api(`/api/log/?${query.toString()}`);
    const data = await res.json();

    if (data.success && data.data) {
      return {
        items: data.data.items || [],
        total: data.data.total || 0,
      };
    }
  } catch (e) {
    console.error("Failed to fetch logs", e);
  }
  return { items: [], total: 0 };
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; keyword?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.p || "1");
  const keyword = params.keyword || "";
  const pageSize = 10;

  const { items, total } = await getLogs(page, pageSize, keyword);

  return (
    <LogClient
      initialLogs={items}
      total={total}
      page={page}
      pageSize={pageSize}
      keyword={keyword}
    />
  );
}
