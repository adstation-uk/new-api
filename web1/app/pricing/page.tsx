"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const BadgeComponent = ({ children, variant = "default", className }: any) => {
  const variants: any = {
    default: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    secondary: "bg-slate-100 text-slate-600 border border-slate-200",
    outline:
      "border border-input bg-background text-slate-600 dark:text-slate-400 font-medium",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export default function PricingPage() {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [groupRatio, setGroupRatio] = useState<any>({});
  const [status, setStatus] = useState<any>({});
  const [currency, setCurrency] = useState("USD");
  const [showWithRecharge, setShowWithRecharge] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("default");
  const [filterVendor, setFilterVendor] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, statusRes] = await Promise.all([
          fetch("/api/pricing"),
          fetch("/api/status"),
        ]);

        const pricingJson = await pricingRes.json();
        const statusJson = await statusRes.json();

        if (pricingJson.success) {
          setModels(pricingJson.data || []);
          setGroupRatio(pricingJson.group_ratio || {});
        }

        if (statusJson.success) {
          setStatus(statusJson.data || {});
          const siteDisplayType = statusJson.data?.quota_display_type || "USD";
          if (["USD", "CNY", "CUSTOM"].includes(siteDisplayType)) {
            setCurrency(siteDisplayType);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const priceRate = status?.price ?? 1;
  const usdExchangeRate = status?.usd_exchange_rate ?? priceRate;
  const customExchangeRate = status?.custom_currency_exchange_rate ?? 1;
  const customCurrencySymbol = status?.custom_currency_symbol ?? "¤";

  const formatPrice = (usdPrice: number) => {
    let priceInUSD = usdPrice;
    if (showWithRecharge) {
      priceInUSD = (usdPrice * priceRate) / usdExchangeRate;
    }

    if (currency === "CNY") {
      return `¥${(priceInUSD * usdExchangeRate).toFixed(4)}`;
    } else if (currency === "CUSTOM") {
      return `${customCurrencySymbol}${(priceInUSD * customExchangeRate).toFixed(4)}`;
    }
    return `$${priceInUSD.toFixed(4)}`;
  };

  const getUsedPrice = (model: any) => {
    let usedGroupRatio = groupRatio[selectedGroup];

    if (selectedGroup === "all" || usedGroupRatio === undefined) {
      let minRatio = Number.POSITIVE_INFINITY;
      if (
        Array.isArray(model.enable_groups) &&
        model.enable_groups.length > 0
      ) {
        model.enable_groups.forEach((g: string) => {
          const r = groupRatio[g];
          if (r !== undefined && r < minRatio) {
            minRatio = r;
            usedGroupRatio = r;
          }
        });
      }
      if (
        usedGroupRatio === undefined ||
        usedGroupRatio === Number.POSITIVE_INFINITY
      )
        usedGroupRatio = 1;
    }

    if (model.quota_type === 1) {
      const usdPrice = (model.model_price / 500000) * usedGroupRatio;
      return {
        price: formatPrice(usdPrice),
        isPerToken: false,
        usedGroupRatio,
      };
    } else {
      const inputPriceUSD = model.model_ratio * 2 * usedGroupRatio;
      const outputPriceUSD =
        model.model_ratio * model.completion_ratio * 2 * usedGroupRatio;
      return {
        input: formatPrice(inputPriceUSD),
        output: formatPrice(outputPriceUSD),
        isPerToken: true,
        usedGroupRatio,
      };
    }
  };

  const filteredModels = useMemo(() => {
    if (!models) return [];
    let result = [...models];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.model_name.toLowerCase().includes(term) ||
          (m.tags && m.tags.toLowerCase().includes(term)) ||
          (m.vendor_name && m.vendor_name.toLowerCase().includes(term)),
      );
    }

    if (filterVendor.length > 0) {
      result = result.filter((m) => filterVendor.includes(m.vendor_name));
    }

    if (filterTag.length > 0) {
      result = result.filter((m) => {
        const tags = m.tags?.split(",") || [];
        return filterTag.some((t) => tags.includes(t.trim()));
      });
    }

    return result.sort((a, b) => {
      if (a.quota_type !== b.quota_type) {
        return a.quota_type - b.quota_type;
      }
      const aIsGpt = a.model_name.startsWith("gpt");
      const bIsGpt = b.model_name.startsWith("gpt");
      if (aIsGpt && !bIsGpt) return -1;
      if (!aIsGpt && bIsGpt) return 1;
      return a.model_name.localeCompare(b.model_name);
    });
  }, [models, search, filterVendor, filterTag]);

  const vendors = useMemo(() => {
    const vSet = new Set<string>();
    models.forEach((m) => {
      if (m.vendor_name) vSet.add(m.vendor_name);
    });
    return Array.from(vSet);
  }, [models]);

  const tagsList = useMemo(() => {
    const tSet = new Set<string>();
    models.forEach((m) => {
      if (m.tags) m.tags.split(",").forEach((t: string) => tSet.add(t.trim()));
    });
    return Array.from(tSet).filter((t) => t);
  }, [models]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6 shrink-0">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">
                筛选排序
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">
                  价格分组 (Group)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGroup("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm",
                      selectedGroup === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50",
                    )}
                  >
                    最优分组
                  </button>
                  {Object.keys(groupRatio).map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm",
                        selectedGroup === group
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50",
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">
                  供应商 (Vendor)
                </label>
                <div className="flex flex-wrap gap-2">
                  {vendors.map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setFilterVendor((prev) =>
                          prev.includes(v)
                            ? prev.filter((x) => x !== v)
                            : [...prev, v],
                        )
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm",
                        filterVendor.includes(v)
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">
                  标签 (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setFilterTag((prev) =>
                          prev.includes(t)
                            ? prev.filter((x) => x !== t)
                            : [...prev, t],
                        )
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm",
                        filterTag.includes(t)
                          ? "bg-emerald-600 text-white"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                模型定价费率
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                查看不同模型、不同分组下的费率详情。支持按量和按次计费，一站式调用全球领先
                AI 能力。
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/80 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索模型、供应商、标签..."
                  className="pl-11 bg-white dark:bg-slate-900 border-none shadow-sm h-12 rounded-2xl focus-visible:ring-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10">
                  {["USD", "CNY"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={cn(
                        "px-5 py-2 rounded-xl text-xs font-black transition-all",
                        currency === curr
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowWithRecharge(!showWithRecharge)}
                  className={cn(
                    "px-5 py-3 rounded-2xl text-xs font-black border transition-all flex items-center gap-2",
                    showWithRecharge
                      ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-500/30"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-500",
                  )}
                >
                  {showWithRecharge ? "显示折后" : "显示原价"}
                </button>
              </div>
            </div>

            <Card className="border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900/60 overflow-hidden rounded-3xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/20 hover:bg-transparent border-b border-slate-100 dark:border-white/5">
                    <TableHead className="py-6 px-8 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                      Model Information
                    </TableHead>
                    <TableHead className="py-6 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                      Billing
                    </TableHead>
                    <TableHead className="py-6 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                      Prompt (1M)
                    </TableHead>
                    <TableHead className="py-6 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                      Completion (1M)
                    </TableHead>
                    <TableHead className="py-6 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={5} className="p-10">
                          <div className="h-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredModels.length > 0 ? (
                    filteredModels.map((model) => {
                      const priceData = getUsedPrice(model);
                      return (
                        <TableRow
                          key={model.model_name}
                          className="hover:bg-slate-50/40 dark:hover:bg-blue-500/5 transition-colors border-b border-slate-50 dark:border-white/5 group"
                        >
                          <TableCell className="py-6 px-8">
                            <div className="flex flex-col gap-2">
                              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {model.model_name}
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {model.vendor_name && (
                                  <BadgeComponent variant="outline">
                                    {model.vendor_name}
                                  </BadgeComponent>
                                )}
                                {model.tags?.split(",").map((tag: string) => (
                                  <BadgeComponent key={tag} variant="secondary">
                                    {tag.trim()}
                                  </BadgeComponent>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <BadgeComponent
                              variant={
                                model.quota_type === 0 ? "default" : "success"
                              }
                            >
                              {model.quota_type === 0 ? "Tokens" : "Flat Rate"}
                            </BadgeComponent>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                            {priceData.isPerToken
                              ? priceData.input
                              : priceData.price}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                            {priceData.isPerToken ? priceData.output : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                <span>Ratio:</span>
                                <span className="text-slate-900 dark:text-white">
                                  {model.model_ratio}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                <span>Comp:</span>
                                <span className="text-slate-900 dark:text-white">
                                  {model.completion_ratio}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-500/10 px-2 py-1 rounded-md mt-1 border border-blue-100 dark:border-blue-500/20">
                                <span className="text-blue-600 dark:text-blue-400">
                                  Fixed:
                                </span>
                                <span className="text-blue-700 dark:text-blue-300 font-black">
                                  {priceData.usedGroupRatio}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-80 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Search className="h-12 w-12 text-slate-300" />
                          <span className="text-slate-500 font-bold">
                            No matching models found
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
