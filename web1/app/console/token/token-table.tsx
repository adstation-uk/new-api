"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TokenKey, TokenActions } from "./token-row-actions";
import {
  renderQuota,
  renderStatus,
  getStatusBadgeClass,
  cn,
} from "@/lib/utils";

interface Token {
  id: number;
  name: string;
  key: string;
  status: number;
  used_quota: number;
  remain_quota: number;
  expired_time: number;
  unlimited_quota: boolean;
  created_time: number;
}

const columns: ColumnDef<Token>[] = [
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => {
      const token = row.original;
      return (
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <span className="font-medium text-sm">{token.name}</span>
          <TokenKey token={token} />
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as number;
      return (
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            getStatusBadgeClass(status),
          )}
        >
          {renderStatus(status)}
        </span>
      );
    },
  },
  {
    accessorKey: "used_quota",
    header: "已用额度",
    cell: ({ row }) => renderQuota(row.getValue("used_quota")),
  },
  {
    accessorKey: "remain_quota",
    header: "剩余额度",
    cell: ({ row }) => {
      const token = row.original;
      return token.unlimited_quota ? (
        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span className="text-lg">∞</span> 无限制
        </span>
      ) : (
        renderQuota(token.remain_quota)
      );
    },
  },
  {
    accessorKey: "created_time",
    header: "创建时间",
    cell: ({ row }) =>
      new Date(
        (row.getValue("created_time") as number) * 1000,
      ).toLocaleString(),
  },
  {
    accessorKey: "expired_time",
    header: "过期时间",
    cell: ({ row }) => {
      const expire = row.getValue("expired_time") as number;
      return expire === -1
        ? "永不过期"
        : new Date(expire * 1000).toLocaleString();
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">操作</div>,
    cell: ({ row }) => <TokenActions token={row.original} />,
  },
];

export function TokenTable({ data }: { data: Token[] }) {
  return <DataTable columns={columns} data={data} className="border-none" />;
}
