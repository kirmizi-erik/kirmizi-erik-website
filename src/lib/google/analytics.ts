import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { getOAuthClient } from "./auth";

let _client: BetaAnalyticsDataClient | null = null;

function getClient() {
  if (_client) return _client;
  _client = new BetaAnalyticsDataClient({
    authClient: getOAuthClient() as never,
  });
  return _client;
}

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

function property() {
  if (!PROPERTY_ID) {
    throw new Error("GA4_PROPERTY_ID env değişkeni eksik");
  }
  return `properties/${PROPERTY_ID}`;
}

export type AnalyticsRange = { startDate: string; endDate: string };

export type AnalyticsSummary = {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
};

export async function fetchSummary(range: AnalyticsRange): Promise<AnalyticsSummary> {
  const client = getClient();
  const [response] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    metrics: [
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  const row = response.rows?.[0];
  const v = (i: number) => Number(row?.metricValues?.[i]?.value ?? 0);
  return {
    totalUsers: v(0),
    newUsers: v(1),
    sessions: v(2),
    pageViews: v(3),
    avgSessionDuration: v(4),
    bounceRate: v(5),
  };
}

export type DailyTrendPoint = {
  date: string;
  users: number;
  sessions: number;
};

export async function fetchDailyTrend(range: AnalyticsRange): Promise<DailyTrendPoint[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return (response.rows ?? []).map((r) => ({
    date: r.dimensionValues?.[0]?.value ?? "",
    users: Number(r.metricValues?.[0]?.value ?? 0),
    sessions: Number(r.metricValues?.[1]?.value ?? 0),
  }));
}

export type TopPage = {
  path: string;
  title: string;
  views: number;
  users: number;
};

export async function fetchTopPages(range: AnalyticsRange, limit = 10): Promise<TopPage[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });

  return (response.rows ?? []).map((r) => ({
    path: r.dimensionValues?.[0]?.value ?? "",
    title: r.dimensionValues?.[1]?.value ?? "",
    views: Number(r.metricValues?.[0]?.value ?? 0),
    users: Number(r.metricValues?.[1]?.value ?? 0),
  }));
}

export type TrafficSource = { source: string; users: number; sessions: number };

export async function fetchTrafficSources(
  range: AnalyticsRange,
  limit = 10,
): Promise<TrafficSource[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }],
    orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    limit,
  });

  return (response.rows ?? []).map((r) => ({
    source: r.dimensionValues?.[0]?.value ?? "Diğer",
    users: Number(r.metricValues?.[0]?.value ?? 0),
    sessions: Number(r.metricValues?.[1]?.value ?? 0),
  }));
}

export type DeviceBreakdown = { device: string; users: number };

export async function fetchDeviceBreakdown(range: AnalyticsRange): Promise<DeviceBreakdown[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
  });

  return (response.rows ?? []).map((r) => ({
    device: r.dimensionValues?.[0]?.value ?? "Bilinmiyor",
    users: Number(r.metricValues?.[0]?.value ?? 0),
  }));
}

export type GeoBreakdown = { country: string; city: string; users: number };

export async function fetchGeoBreakdown(
  range: AnalyticsRange,
  limit = 10,
): Promise<GeoBreakdown[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: "country" }, { name: "city" }],
    metrics: [{ name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    limit,
  });

  return (response.rows ?? []).map((r) => ({
    country: r.dimensionValues?.[0]?.value ?? "",
    city: r.dimensionValues?.[1]?.value ?? "",
    users: Number(r.metricValues?.[0]?.value ?? 0),
  }));
}
