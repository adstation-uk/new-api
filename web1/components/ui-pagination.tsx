"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
}

export function Pagination({ page, total, pageSize }: PaginationProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("p", newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="p-4 border-t flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        共 {total} 条数据，第 {page} / {totalPages} 页
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
