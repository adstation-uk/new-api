import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserInfo } from "@/lib/user";
import { LogoutButton } from "@/components/logout-button";

export default async function ConsolePage() {
  const user = await getUserInfo();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">控制台</h1>
        <LogoutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>用户信息 (Server Rendered)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">用户名:</span> {user.username}
              </p>
              <p>
                <span className="font-semibold">角色:</span>{" "}
                {user.role === 100 ? "管理员" : "普通用户"}
              </p>
              <p>
                <span className="font-semibold">余额:</span> $
                {(user.quota / 500000).toFixed(4)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API 状态</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 font-medium">
              后端连接正常 (Direct Backend Call)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
