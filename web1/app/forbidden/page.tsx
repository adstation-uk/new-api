import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center p-4">
      <h1 className="text-4xl font-bold">403 - 权限不足</h1>
      <p className="text-muted-foreground">您没有访问此页面的权限。</p>
      <Button asChild>
        <Link href="/console">返回控制台</Link>
      </Button>
    </div>
  );
}
