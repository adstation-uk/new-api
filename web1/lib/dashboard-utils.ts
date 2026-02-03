export function processDashboardData(quotaData: any[]) {
  if (!quotaData)
    return {
      pieData: [],
      barData: [],
      lineData: [],
      trend: { times: [], consumeQuota: [] },
    };

  const modelConsumption: Record<string, number> = {};
  const modelCounts: Record<string, number> = {};
  const hourMap: Record<string, any> = {};

  quotaData.forEach((item) => {
    const model = item.model_name || "unknown";
    modelConsumption[model] =
      (modelConsumption[model] || 0) + (item.quota || 0);
    modelCounts[model] = (modelCounts[model] || 0) + (item.count || 0);

    const time = new Date(item.created_at * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (!hourMap[time]) hourMap[time] = { Time: time, Usage: 0 };
    hourMap[time].Usage += item.quota;
    hourMap[time][model] = (hourMap[time][model] || 0) + item.quota;
  });

  const pieData = Object.entries(modelConsumption)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const barData = Object.entries(modelCounts)
    .map(([Model, Counts]) => ({ Model, Counts }))
    .sort((a, b) => b.Counts - a.Counts)
    .slice(0, 10);

  const lineData = Object.values(hourMap).sort((a: any, b: any) =>
    a.Time.localeCompare(b.Time),
  );

  const timesTrend = lineData.map((d: any) => ({ value: d.Usage || 0 }));
  const quotaTrend = lineData.map((d: any) => ({ value: d.Usage || 0 }));

  return {
    pieData,
    barData,
    lineData,
    trend: {
      times: timesTrend,
      consumeQuota: quotaTrend,
    },
  };
}
