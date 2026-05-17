export function TrustPanel() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <details className="group">
        <summary className="cursor-pointer list-none px-5 py-5 sm:px-6 flex items-center justify-between gap-3">
          <span className="text-sm sm:text-base font-semibold text-white">
            What counts?{" "}
            <span className="text-zinc-400 font-normal">(methodology, confidence, safety)</span>
          </span>
          <span className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/25 text-zinc-500 text-lg leading-none group-open:rotate-180 transition-transform">
            ⌄
          </span>
        </summary>
        <div className="px-5 sm:px-6 pb-6 pt-5 grid gap-4 md:grid-cols-2 text-sm text-zinc-400 leading-relaxed border-t border-white/10">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-2">
              How 1 Peter is defined
            </p>
            <p className="mb-3 text-xs text-zinc-500">
              Window: 2026 YTD, starting Jan 1, 2026.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="text-zinc-200 font-medium">1 Peter = 203,976</span>{" "}
                verified contributions on @steipete&apos;s 2026 YTD graph (live via GitHub GraphQL).
              </li>
              <li>
                <span className="text-zinc-300">82.8%</span> of Peter&apos;s motion (168,882) is in
                restricted/private repos — visible on his profile graph, invisible to public search.
              </li>
              <li>
                Org totals are public-search only: commits + PRs + issues. Private-repo work
                inside orgs is not counted.
              </li>
              <li>
                The comparison is therefore <span className="text-zinc-200">asymmetric by design</span>{" "}
                — it tilts toward Peter. That asymmetry is the point: it forces the question of what
                orgs are willing to expose.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold mb-2">
              What ranking does not mean
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Not productivity, impact, quality, or developer value</li>
              <li>Not private repository contents unless explicitly authorized</li>
              <li>Not Slack, design docs, meetings, CI minutes, Linear, or Jira</li>
              <li>Not org-wide PR reviews yet; those require a deeper authenticated collector</li>
              <li>Not individual engineer ranking by default</li>
            </ul>
          </div>
          <div className="md:col-span-2 grid gap-3 sm:grid-cols-3">
            <TrustMetric label="High confidence" text="Public-heavy orgs with broad visible coverage." />
            <TrustMetric label="Medium confidence" text="Useful directional read, but public data is incomplete." />
            <TrustMetric label="Low confidence" text="Private-heavy orgs need an install for a real number." />
          </div>
          <p className="md:col-span-2 rounded-2xl bg-amber-500/10 border border-amber-400/25 px-4 py-3 text-amber-50/95">
            This is{" "}
            <span className="font-semibold text-amber-100">not a productivity score</span>. It is a{" "}
            <span className="font-semibold text-amber-100">
              2026 YTD GitHub-visible engineering activity benchmark
            </span>
            —more motion does not automatically mean more value.
          </p>
          <p className="md:col-span-2 text-xs text-zinc-500">
            Public mode is incomplete by design. Private org installs can improve coverage later,
            but the product should stay about R&D systems and cohorts, not surveillance.
          </p>
        </div>
      </details>
    </section>
  );
}

function TrustMetric({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{text}</p>
    </div>
  );
}
