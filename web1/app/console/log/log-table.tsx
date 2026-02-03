"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { renderQuota, renderLogType, getLogTypeClass, cn } from "@/lib/utils";

interface Log {
  id: number;
  created_at: number;
  type: number;
  username: string;
  token_name: string;
  model_name: string;
  quota: number;
  prompt_tokens: number;
  completion_tokens: number;
  use_time: number;
  content: string;
}

const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "created_at",
    header: "时间",
    cell: ({ row }) =>
      new Date((row.getValue("created_at") as number) * 1000).toLocaleString(),
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => {
      const type = row.getValue("type") as number;
      return (
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            getLogTypeClass(type),
          )}
        >
          {renderLogType(type)}
        </span>
      );
    },
  },
  {
    accessorKey: "model_name",
    header: "模型",
    cell: ({ row }) => {
      const model = row.getValue("model_name") as string;
      return model ? (
        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono border border-border">
          {model}
        </span>
      ) : null;
    },
  },
  {
    accessorKey: "username",
    header: "用户 / 令牌",
    cell: ({ row }) => {
      const log = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{log.username}</span>
          <span className="text-xs text-muted-foreground/70">
            {log.token_name}
          </span>
        </div>
      );
    },
  },
  {
    id: "consumption",
    header: "消耗详情",
    cell: ({ row }) => {
      const log = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">
            提示: {log.prompt_tokens} | 补全: {log.completion_tokens}
          </span>
          <span className="font-bold text-primary">
            {renderQuota(log.quota)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "use_time",
    header: "耗时",
    cell: ({ row }) => `${row.getValue("use_time")}ms`,
  },
  {
    accessorKey: "content",
    header: "详情",
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate text-muted-foreground"
        title={row.getValue("content")}
      >
        {row.getValue("content")}
      </div>
    ),
  },
];

export function LogTable({ data }: { data: Log[] }) {
  return <DataTable columns={columns} data={data} className="border-none" />;
}
