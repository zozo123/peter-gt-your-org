import "server-only";

import {
  buildRankedSnapshots,
  MOCK_FIXTURES,
  PETER_YEAR_END_REFERENCE,
  PETER_YTD_REFERENCE,
  projectedYearEnd,
} from "./mockSnapshots";
import type { Snapshot, SnapshotFixture } from "./types";

const GITHUB_API = "https://api.github.com";
const DEFAULT_INCREDIBUILD_ORG = "Incredibuild-RND";

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
  if (!token) {
    return buildRankedSnapshots();
  }

  const incredibuild = await getIncredibuildFixture(token).catch((error: unknown) =>
    getIncredibuildErrorFixture(errorMessage(error)),
  );

  return buildRankedSnapshots({
    ...MOCK_FIXTURES,
    incredibuild,
  });
}

export function hasGithubConnection(): boolean {
  return Boolean(githubToken());
}

async function getIncredibuildFixture(token: string): Promise<SnapshotFixture> {
  const orgSlug = envString("INCREDIBUILD_GITHUB_ORG") ?? DEFAULT_INCREDIBUILD_ORG;
  const [org, commits, pullRequests, issues, repositoryCount] =
    await Promise.all([
      githubJson<GitHubOrg>(token, `/orgs/${orgSlug}`),
      searchTotal(token, "/search/commits", `org:${orgSlug} committer-date:>=${MOCK_FIXTURES.incredibuild.ytdStart}`),
      searchTotal(token, "/search/issues", `org:${orgSlug} type:pr created:>=${MOCK_FIXTURES.incredibuild.ytdStart}`),
      searchTotal(token, "/search/issues", `org:${orgSlug} type:issue created:>=${MOCK_FIXTURES.incredibuild.ytdStart}`),
      paginatedCount(token, `/orgs/${orgSlug}/repos`, { type: "all" }),
    ]);

  const total = commits + pullRequests + issues;
  const activeContributors = envNumber("INCREDIBUILD_ACTIVE_CONTRIBUTORS") ?? 0;
  const repositories =
    envNumber("INCREDIBUILD_REPOSITORIES") ??
    repositoryCount ??
    (org.public_repos ?? 0) + (org.total_private_repos ?? org.owned_private_repos ?? 0);

  const contributorSource = envNumber("INCREDIBUILD_ACTIVE_CONTRIBUTORS")
    ? "active contributor count from INCREDIBUILD_ACTIVE_CONTRIBUTORS"
    : "active contributor count not available; set INCREDIBUILD_ACTIVE_CONTRIBUTORS for Peter Density";

  return {
    ...MOCK_FIXTURES.incredibuild,
    org: "incredibuild",
    orgDisplayName: envString("INCREDIBUILD_DISPLAY_NAME") ?? org.name ?? "Incredibuild",
    visibility: {
      mode: "private",
      confidence: total > 0 ? "high" : "medium",
      completeness: total > 0 ? 0.92 : 0.35,
      note: `Token-backed GitHub Search counts for @${org.login ?? orgSlug}. Includes private repos visible to the token; ${contributorSource}.`,
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
      remainingDays: MOCK_FIXTURES.incredibuild.forecast.remainingDays,
    },
  };
}

function getIncredibuildErrorFixture(reason: string): SnapshotFixture {
  return {
    ...MOCK_FIXTURES.incredibuild,
    visibility: {
      ...MOCK_FIXTURES.incredibuild.visibility,
      note: `GitHub token is configured, but Incredibuild could not be loaded: ${reason}`,
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
