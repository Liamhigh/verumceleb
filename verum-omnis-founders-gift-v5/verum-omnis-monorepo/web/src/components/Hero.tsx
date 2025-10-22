import React from "react";

export default function Hero() {
  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
      <h1 className="text-2xl font-semibold">Verum Omnis – Repo Finisher</h1>
      <p className="mt-2 opacity-80">
        Repo is managed by <strong>GitHub Copilot (Repo Finisher)</strong>.
        It handles merges, tests, and deploys automatically without asking
        questions. Integrity and constitutional guardrails are always enforced.
      </p>
      <div className="mt-4 flex gap-3">
        <a
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
          href="https://github.com/Liamhigh/verumceleb?tab=copilot"
          target="_blank"
          rel="noreferrer"
        >
          Open Copilot Chat
        </a>
        <a
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
          href="https://github.com/Liamhigh/verumceleb/pulls"
          target="_blank"
          rel="noreferrer"
        >
          View Pull Requests
        </a>
      </div>
      <p className="mt-4 text-sm opacity-70">
        Note: The on-site chat has been swapped out. Use Copilot Chat in GitHub
        to run merges, tests, and deploys.
      </p>
    </div>
  );
}
