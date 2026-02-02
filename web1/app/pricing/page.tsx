"use client";

import { Footer } from "@/components/footer";
import { Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            简单透明的计费方式
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            全场模型 75 折起，注册即送 $1 体验额度
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Example Pricing Cards */}
          <PricingCard
            title="免费试用"
            price="$0"
            desc="注册即刻领取"
            features={["$1 赠送额度", "不限速", "支持所有大模型", "社区支持"]}
          />
          <PricingCard
            title="开发者"
            price="$10"
            desc="适合个人和初创项目"
            features={["包含 $15 额度", "优先响应", "全场模型折扣", "邮件支持"]}
            featured
          />
          <PricingCard
            title="企业版"
            price="$99"
            desc="大规模生产环境"
            features={[
              "包含 $150 额度",
              "SLA 保证",
              "专属渠道",
              "1对1 技术支持",
            ]}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PricingCard({ title, price, desc, features, featured = false }: any) {
  return (
    <div
      className={`p-8 rounded-3xl border ${featured ? "border-blue-500 shadow-xl shadow-blue-500/10 scale-105 bg-blue-50/10" : "border-slate-200 dark:border-white/10"} transition-all`}
    >
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
        {title}
      </h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-black text-slate-900 dark:text-white">
          {price}
        </span>
        <span className="text-slate-400">起</span>
      </div>
      <p className="text-sm text-slate-500 mb-8">{desc}</p>
      <ul className="space-y-4 mb-8">
        {features.map((f: string) => (
          <li
            key={f}
            className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
          >
            <Check size={16} className="text-green-500" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        className={`w-full py-6 rounded-xl font-bold transition-all ${featured ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-900 dark:text-white"}`}
      >
        立即购买
      </Button>
    </div>
  );
}
