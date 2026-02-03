import { api } from "@/lib/api";
import { DashboardClient } from "./dashboard-client";

async function getDashboardData() {
  try {
    const [userRes, quotaRes, statusRes, uptimeRes] = await Promise.all([
      api("/api/user/self"),
      api("/api/data/self/?default_time=today"),
      api("/api/status"),
      api("/api/uptime/status").catch((e) => ({
        json: async () => ({ success: false }),
        ok: false,
      })),
    ]);

    const userJson = await userRes.json();
    const quotaJson = await quotaRes.json();
    const statusJson = await statusRes.json();

    // Safety check for uptime response
    let uptimeJson = { success: false, data: [] };
    try {
      if (uptimeRes && typeof uptimeRes.json === "function") {
        uptimeJson = await uptimeRes.json();
      }
    } catch (e) {
      // ignore uptime parse errors
    }

    const userData = userJson.success ? userJson.data : null;
    const quotaData = quotaJson.success ? quotaJson.data || [] : [];
    const statusData = statusJson.success ? statusJson.data : null;

    let uptimeData = [];
    if (uptimeJson.success && Array.isArray(uptimeJson.data)) {
      // Flatten uptime data if it's grouped
      uptimeData =
        uptimeJson.data.flatMap((group: any) =>
          group.monitors.map((m: any) => ({
            name: m.name,
            status: m.status === 1 ? "up" : "down",
            uptime: m.uptime,
          })),
        ) || [];
    }

    return {
      user: userData,
      quotaData,
      status: statusData,
      uptimeData,
    };
  } catch (e) {
    console.error("Failed to fetch dashboard data", e);
    return {
      user: null,
      quotaData: [],
      status: null,
      uptimeData: [],
    };
  }
}

export default async function DashboardPage() {
  const { user, quotaData, status, uptimeData } = await getDashboardData();

  return (
    <DashboardClient
      user={user}
      quotaData={quotaData}
      status={status}
      uptimeData={uptimeData}
    />
  );
}
