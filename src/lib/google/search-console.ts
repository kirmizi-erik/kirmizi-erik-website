import "server-only";

import { google } from "googleapis";

import { getOAuthClient } from "./auth";

const SITE_URL = process.env.GSC_SITE_URL ?? "https://www.kirmizierik.com.tr";

let _client: ReturnType<typeof google.searchconsole> | null = null;

function getClient() {
  if (_client) return _client;
  _client = google.searchconsole({ version: "v1", auth: getOAuthClient() });
  return _client;
}

export type SearchRange = { startDate: string; endDate: string };

export type SearchSummary = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

async function runQuery(
  range: SearchRange,
  dimensions: string[],
  rowLimit = 25,
) {
  const client = getClient();
  const res = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions,
      rowLimit,
    },
  });
  return res.data.rows ?? [];
}

export async function fetchSearchSummary(range: SearchRange): Promise<SearchSummary> {
  const rows = await runQuery(range, []);
  const r = rows[0];
  return {
    clicks: r?.clicks ?? 0,
    impressions: r?.impressions ?? 0,
    ctr: r?.ctr ?? 0,
    position: r?.position ?? 0,
  };
}

export type SearchQuery = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function fetchTopQueries(
  range: SearchRange,
  limit = 25,
): Promise<SearchQuery[]> {
  const rows = await runQuery(range, ["query"], limit);
  return rows.map((r) => ({
    query: r.keys?.[0] ?? "",
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

export type SearchPage = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function fetchTopPagesSearch(
  range: SearchRange,
  limit = 25,
): Promise<SearchPage[]> {
  const rows = await runQuery(range, ["page"], limit);
  return rows.map((r) => ({
    page: r.keys?.[0] ?? "",
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

export type SearchDailyPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

export async function fetchSearchDailyTrend(range: SearchRange): Promise<SearchDailyPoint[]> {
  const rows = await runQuery(range, ["date"], 1000);
  return rows
    .map((r) => ({
      date: r.keys?.[0] ?? "",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
