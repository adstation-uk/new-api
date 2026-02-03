import { api } from "@/lib/api";
import { TopupClient } from "./topup-client";

async function getTopupData() {
  try {
    const [userRes, topupInfoRes, logsRes] = await Promise.all([
      api("/api/user/self"),
      api("/api/user/topup/info"),
      api("/api/log/?type=1&p=0&size=10"),
    ]);

    const userJson = await userRes.json();
    const topupInfoJson = await topupInfoRes.json();
    const logsJson = await logsRes.json();

    return {
      user: userJson.success ? userJson.data : null,
      topupInfo: topupInfoJson.success ? topupInfoJson.data : null,
      logs:
        logsJson.success && logsJson.data && logsJson.data.items
          ? logsJson.data.items
          : [],
    };
  } catch (e) {
    console.error("Failed to fetch topup data", e);
    return { user: null, topupInfo: null, logs: [] };
  }
}

export default async function TopupPage() {
  const { user, topupInfo, logs } = await getTopupData();

  return <TopupClient user={user} topupInfo={topupInfo} initialLogs={logs} />;
}
