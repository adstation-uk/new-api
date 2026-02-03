"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  Shield,
  Unlock,
  ArrowRight,
  Coins,
  Copy,
  Gift,
} from "lucide-react";
import {
  OpenAI,
  Claude,
  Gemini,
  DeepSeek,
  Qwen,
  Wenxin,
  Midjourney,
  XAI,
  Moonshot,
  Zhipu,
  Suno,
  Volcengine,
  Minimax,
  Hunyuan,
  Spark,
} from "@lobehub/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

const HERO_MODELS_DATA = [
  {
    name: "Suno music",
    price: "$0.075",
    original: "$0.12",
    discount: "-37.5% OFF",
    unit: "/req",
    icon: (size: number) => <Suno size={size} />,
    pos: "-translate-x-32 -translate-y-36 rotate-[-6deg]",
  },
  {
    name: "Gemini 3 Pro",
    price: "$9.0",
    original: "$12.0",
    discount: "BEST VALUE",
    unit: "/M",
    icon: (size: number) => <Gemini.Color size={size} />,
    pos: "translate-x-4 -translate-y-8",
    featured: true,
  },
  {
    name: "GPT-5",
    price: "$7.5",
    original: "$10",
    discount: "-25% OFF",
    unit: "/M",
    icon: (size: number) => <OpenAI size={size} />,
    pos: "translate-x-40 -translate-y-44 rotate-[4deg]",
  },
  {
    name: "Veo 3.1",
    price: "$3.0",
    original: "$4.38",
    discount: "-31% OFF",
    unit: "/req",
    icon: (size: number) => <Gemini size={size} />,
    pos: "-translate-x-20 translate-y-32 rotate-[-2deg]",
  },
  {
    name: "Gemini 2.5 Flash",
    price: "$1.8",
    original: "$2.5",
    discount: "-28% OFF",
    unit: "/M",
    icon: (size: number) => <Gemini.Color size={size} />,
    pos: "translate-x-40 translate-y-24 rotate-[5deg]",
  },
];

const MODEL_GROUPS_ITEMS = [
  { name: "OpenAI", icon: <OpenAI size={24} />, desc: "GPT-4o, GPT-5" },
  {
    name: "Anthropic",
    icon: <Claude.Color size={24} />,
    desc: "Claude 3.5 Sonnet",
  },
  { name: "Google", icon: <Gemini.Color size={24} />, desc: "Gemini 3 Pro" },
  { name: "Moonshot", icon: <Moonshot size={24} />, desc: "Kimi-latest" },
  { name: "Zhipu", icon: <Zhipu size={24} />, desc: "GLM-4 Plus" },
  { name: "DeepSeek", icon: <DeepSeek.Color size={24} />, desc: "DeepSeek V3" },
  { name: "Midjourney", icon: <Midjourney size={24} />, desc: "Image Gen V6" },
  { name: "X.AI", icon: <XAI size={24} />, desc: "Grok-2" },
  { name: "Aliyun", icon: <Qwen.Color size={24} />, desc: "Qwen 2.5" },
  { name: "Suno", icon: <Suno size={24} />, desc: "Suno V3.5" },
];

const MODEL_SCROLL_DATA = [
  { name: "GPT-4o", discount: "80% OFF" },
  { name: "Claude 3.5 Sonnet", discount: "NEW" },
  { name: "Gemini 3 Pro", discount: "TOP" },
  { name: "DeepSeek V3", discount: "VALUE" },
  { name: "Midjourney V6", discount: "PRO" },
  { name: "Suno V3.5", discount: "HOT" },
  { name: "Kimi-latest", discount: "FAST" },
  { name: "Grok-2", discount: "X" },
];

export default function HomePage() {
  const [serverAddress, setServerAddress] = useState("");
  const [homeContent, setHomeContent] = useState("");

  useEffect(() => {
    setServerAddress(window.location.origin);

    // Fetch home page content
    const fetchHomeContent = async () => {
      try {
        const res = await fetch("/api/home_page_content");
        const json = await res.json();
        if (json.success) {
          setHomeContent(json.data);
        }
      } catch (e) {}
    };
    fetchHomeContent();
  }, []);

  const handleCopyBaseURL = () => {
    navigator.clipboard.writeText(serverAddress);
    toast.success("已复制到剪切板");
  };

  const advantages = [
    {
      title: "价格更低",
      desc: "相比官方定价，我们的价格更具竞争力，为您节省每一分钱。",
      icon: <Coins size={32} className="text-blue-500" />,
    },
    {
      title: "服务稳定",
      desc: "高可用架构设计，确保服务全天候在线，随时响应您的请求。",
      icon: <Shield size={32} className="text-green-500" />,
    },
    {
      title: "无限制",
      desc: "没有繁琐的请求限制，释放您的创造力，尽情探索 AI 的可能性。",
      icon: <Unlock size={32} className="text-purple-500" />,
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Banner 部分 */}
      <div className="w-full lg:min-h-[calc(100vh-64px)] relative overflow-hidden flex flex-col justify-center pt-20 bg-white dark:bg-slate-900">
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(248,250,252,1),rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_50%_20%,rgba(15,23,42,1),rgba(2,6,23,1))]" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        <div className="container mx-auto px-6 z-10 text-slate-900 dark:text-white h-full flex items-center">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
            {/* 左侧内容区 */}
            <div className="flex flex-col items-start text-left max-w-2xl w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                <Zap size={14} />
                <span>下一代 API 网关</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-slate-900 dark:text-white mb-6">
                统一的
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
                  大模型接口网关
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
                更好的价格，更好的稳定性，只需要将模型基址替换为：
              </p>

              {/* BASE URL */}
              <div className="w-full max-w-md mb-10">
                <div className="relative flex items-center h-14 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 hover:border-blue-500/50 transition-colors group">
                  <input
                    readOnly
                    value={serverAddress}
                    className="bg-transparent border-none outline-none flex-1 text-slate-800 dark:text-gray-200 font-medium focus:ring-0 w-full"
                  />
                  <button
                    onClick={handleCopyBaseURL}
                    className="ml-2 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer border-none flex items-center justify-center"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/console"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-10 h-14 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 cursor-pointer no-underline"
                >
                  <span>立即免费开始</span>
                  <ArrowRight size={20} />
                </Link>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 text-sm font-medium text-red-600 dark:text-red-400 animate-pulse">
                    <Gift size={16} />
                    <span>注册即送 $1</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <Zap size={14} className="fill-current" />
                    <span>全场模型 75 折起</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧展示区 - 错落卡片 */}
            <div className="relative lg:w-1/2 w-full hidden md:flex justify-center items-center h-[600px]">
              {HERO_MODELS_DATA.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "absolute transform transition-all hover:scale-105 hover:z-50",
                    item.pos,
                    item.featured ? "z-30" : "z-20",
                  )}
                >
                  <div
                    className={cn(
                      "p-8 rounded-3xl border shadow-2xl backdrop-blur-xl",
                      item.featured
                        ? "w-80 bg-gradient-to-br from-blue-600 to-indigo-700 border-white/20 shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
                        : "w-72 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-white/10",
                    )}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      {item.icon(item.featured ? 48 : 40)}
                      <span
                        className={cn(
                          "font-bold tracking-tight",
                          item.featured
                            ? "text-2xl text-white"
                            : "text-xl text-slate-900 dark:text-white",
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "text-4xl font-black",
                            item.featured
                              ? "text-white"
                              : "text-slate-900 dark:text-white",
                          )}
                        >
                          {item.price}
                          <span
                            className={cn(
                              "text-lg font-normal",
                              item.featured
                                ? "text-blue-100"
                                : "text-slate-500 dark:text-gray-400",
                            )}
                          >
                            {item.unit || "/M"}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "text-sm line-through",
                            item.featured
                              ? "text-blue-200/60"
                              : "text-slate-400 dark:text-gray-500",
                          )}
                        >
                          {item.original}
                          {item.unit || "/M"}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "inline-flex px-3 py-1 rounded-full text-xs font-bold border",
                          item.featured
                            ? "bg-white/20 text-white border-white/10"
                            : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
                        )}
                      >
                        {item.discount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 优势部分 */}
      <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              优势
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full mb-6" />
            <p className="text-xl text-slate-600 dark:text-slate-400">
              为什么选择我们
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((adv, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
              >
                <div className="mb-6 p-4 rounded-full bg-slate-100 dark:bg-slate-900 w-fit group-hover:scale-110 transition-transform hidden md:block relative z-10 shadow-sm">
                  {adv.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white relative z-10">
                  {adv.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                  {adv.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 pt-12 border-t border-slate-200 dark:border-white/10">
            <p className="text-center text-slate-400 dark:text-slate-500 mb-10 font-medium tracking-widest uppercase text-sm">
              支持全球主流大模型
            </p>
            <div className="space-y-6">
              {[0, 1].map((row) => (
                <div key={row} className="flex overflow-hidden group">
                  <div
                    className={cn(
                      "flex gap-8 py-4 animate-scroll-logos",
                      row === 1 && "animate-scroll-logos-reverse",
                    )}
                  >
                    {[
                      ...MODEL_GROUPS_ITEMS,
                      ...MODEL_GROUPS_ITEMS,
                      ...MODEL_GROUPS_ITEMS,
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl whitespace-nowrap"
                      >
                        {item.icon}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 滚动条部分 */}
      <div className="w-full py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 overflow-hidden relative">
        <div className="flex animate-scroll-left w-max hover:[animation-play-state:paused]">
          {[
            ...MODEL_SCROLL_DATA,
            ...MODEL_SCROLL_DATA,
            ...MODEL_SCROLL_DATA,
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-800 rounded-2xl mx-4 border border-slate-100 dark:border-white/5 shadow-sm"
            >
              <span className="font-bold text-slate-800 dark:text-white">
                {item.name}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-500 text-white text-xs font-bold">
                {item.discount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 自定义公告/内容 */}
      {homeContent && (
        <div className="w-full bg-white dark:bg-slate-900 py-16 border-b border-slate-100 dark:border-white/5">
          <div className="container mx-auto px-6">
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: homeContent }}
            />
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
        @keyframes scroll-right {
          from {
            transform: translateX(-33.333%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll-logos {
          animation: scroll-left 50s linear infinite;
        }
        .animate-scroll-logos-reverse {
          animation: scroll-right 50s linear infinite;
        }
      `}</style>
    </div>
  );
}
