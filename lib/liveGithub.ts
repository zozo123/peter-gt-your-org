import "server-only";

import {
  buildRankedSnapshots,
  MOCK_FIXTURES,
  PETER_YEAR_END_REFERENCE,
  PETER_YTD_REFERENCE,
  projectedYearEnd,
  YTD_START,
  REMAINING_DAYS,
} from "./mockSnapshots";
import type { Snapshot, SnapshotFixture } from "./types";

const GITHUB_API = "https://api.github.com";

type GitHubOrg = {
  login?: string;
  name?: string | null;
  public_repos?: number;
  total_private_repos?: number;
  owned_private_repos?: number;
};

type GitHubSearchResponse = {
  total_count: number;
};

export async function getConfiguredSnapshots(): Promise<Snapshot[]> {
  const token = githubToken();
  const orgSlug = envString("GITHUB_ORG");
  if (!token || !orgSlug) {
    return buildRankedSnapshots();
  }

  const slug = normalizeSlug(orgSlug);
  const live = await getLiveOrgFixture(token, slug).catch((error: unknown) =>
    getLiveOrgErrorFixture(slug, errorMessage(error)),
  );

  return buildRankedSnapshots({ ...MOCK_FIXTURES, [slug]: live });
}

export function hasGithubConnection(): boolean {
  return Boolean(githubToken() && envString("GITHUB_ORG"));
}

export function configuredOrgSlug(): string | undefined {
  const slug = envString("GITHUB_ORG");
  return slug ? normalizeSlug(slug) : undefined;
}

async function getLiveOrgFixture(token: string, slug: string): Promise<SnapshotFixture> {
  const [org, commits, pullRequests, issues, repositoryCount] = await Promise.all([
    githubJson<GitHubOrg>(token, `/orgs/${slug}`),
    searchTotal(token, "/search/commits", `org:${slug} committer-date:>=${YTD_START}`),
    searchTotal(token, "/search/issues", `org:${slug} type:pr created:>=${YTD_START}`),
    searchTotal(token, "/search/issues", `org:${slug} type:issue created:>=${YTD_START}`),
    paginatedCount(token, `/orgs/${slug}/repos`, { type: "all" }),
  ]);

  const total = commits + pullRequests + issues;
  const activeContributors = envNumber("GITHUB_ORG_ACTIVE_CONTRIBUTORS") ?? 0;
  const repositories =
    envNumber("GITHUB_ORG_REPOSITORIES") ??
    repositoryCount ??
    (org.public_repos ?? 0) + (org.total_private_repos ?? org.owned_private_repos ?? 0);

  const contributorSource = envNumber("GITHUB_ORG_ACTIVE_CONTRIBUTORS")
    ? "active contributor count from GITHUB_ORG_ACTIVE_CONTRIBUTORS"
    : "active contributor count not available; set GITHUB_ORG_ACTIVE_CONTRIBUTORS for Peter Density";

  const displayName =
    envString("GITHUB_ORG_DISPLAY_NAME") ?? org.name ?? org.login ?? slug;

  return {
    org: slug,
    orgDisplayName: displayName,
    benchmarkUser: "steipete",
    date: "2026-05-17",
    scope: "org",
    cohort: {
      label: "Live org",
      sizeBand: "mid-size",
      exposure: "mixed",
    },
    ytdStart: YTD_START,
    visibility: {
      mode: "private",
      confidence: total > 0 ? "high" : "medium",
      completeness: total > 0 ? 0.92 : 0.35,
      note: `Token-backed GitHub Search counts for @${org.login ?? slug}. Includes private repos visible to the token; ${contributorSource}.`,
    },
    orgYtd: {
      total,
      commits,
      pullRequests,
      issues,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors,
      repositories,
      privateReposIncluded: true,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(total),
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
      remainingDays: REMAINING_DAYS,
    },
  };
}

function getLiveOrgErrorFixture(slug: string, reason: string): SnapshotFixture {
  return {
    org: slug,
    orgDisplayName: slug,
    benchmarkUser: "steipete",
    date: "2026-05-17",
    scope: "org",
    cohort: {
      label: "Live org",
      sizeBand: "mid-size",
      exposure: "mixed",
    },
    ytdStart: YTD_START,
    visibility: {
      mode: "private",
      confidence: "low",
      completeness: 0,
      note: `GitHub token is configured, but @${slug} could not be loaded: ${reason}`,
    },
    orgYtd: { total: 0, commits: 0, pullRequests: 0, issues: 0, reviews: 0, other: 0 },
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: { activeContributors: 0, repositories: 0, privateReposIncluded: false },
    forecast: {
      orgYearEndTotal: 0,
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
      remainingDays: REMAINING_DAYS,
    },
  };
}

async function searchTotal(token: string, path: string, query: string): Promise<number> {
  const result = await githubJson<GitHubSearchResponse>(token, path, { q: query });
  return result.total_count;
}

async function paginatedCount(
  token: string,
  path: string,
  query?: Record<string, string>,
): Promise<number | undefined> {
  const response = await githubFetch(token, path, {
    ...query,
    per_page: "1",
  });

  if (!response.ok) {
    return undefined;
  }

  const link = response.headers.get("link");
  const pageMatch = link?.match(/[?&]page=(\d+)[^>]*>; rel="last"/);
  if (pageMatch?.[1]) {
    return Number(pageMatch[1]);
  }

  const body = (await response.json()) as unknown;
  return Array.isArray(body) ? body.length : undefined;
}

async function githubJson<T>(
  token: string,
  path: string,
  query?: Record<string, string>,
): Promise<T> {
  const response = await githubFetch(token, path, query);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${path}`);
  }

  return response.json() as Promise<T>;
}

function githubFetch(
  token: string,
  path: string,
  query?: Record<string, string>,
): Promise<Response> {
  const url = new URL(`${GITHUB_API}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

function githubToken(): string | undefined {
  return envString("GITHUB_TOKEN") ?? envString("GH_TOKEN");
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/^@/, "");
}

function envString(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function envNumber(name: string): number | undefined {
  const raw = envString(name);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown GitHub API error";
}
