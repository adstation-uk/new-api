import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { TokenSearch } from "./token-search";
import { TokenCreate } from "./token-create";
import { Pagination } from "@/components/ui-pagination";
import { TokenTable } from "./token-table";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">我的令牌</h1>
          <TokenCreate />
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b flex gap-4">
            <TokenSearch initialKeyword={keyword} />
          </div>

          <TokenTable data={items} />

          <Pagination page={page} total={total} pageSize={pageSize} />
        </Card>
      </div>
    </div>
  );
}
