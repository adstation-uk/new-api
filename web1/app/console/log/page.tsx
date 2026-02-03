import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { LogSearch } from "./log-search";
import { Pagination } from "@/components/ui-pagination";
import { LogTable } from "./log-table";

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
  const pageSize = 15;

  const { items, total } = await getLogs(page, pageSize, keyword);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">使用日志</h1>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b flex gap-4">
            <LogSearch initialKeyword={keyword} />
          </div>

          <LogTable data={items} />

          <Pagination page={page} total={total} pageSize={pageSize} />
        </Card>
      </div>
    </div>
  );
}
