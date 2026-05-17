# peter-gt-your-org

A Next.js mock for ranking R&D orgs in units of Peter.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Private Incredibuild Preview

Create `.env.local` or start dev with your local GitHub CLI token:

```bash
GITHUB_TOKEN="$(gh auth token)" npm run dev
```

Optional env vars:

```bash
INCREDIBUILD_GITHUB_ORG=Incredibuild-RND
INCREDIBUILD_ACTIVE_CONTRIBUTORS=120
INCREDIBUILD_REPOSITORIES=80
```

The token is read only on the Next.js server. It is never sent to the browser.

## Methodology

Public preview numbers are 2026 YTD GitHub-visible counts starting Jan 1, 2026.
Current public mode uses verified commit, pull request, and issue counts where available.

This is not a productivity score.

