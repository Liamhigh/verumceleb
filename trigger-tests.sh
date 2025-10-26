#!/usr/bin/env bash
# Trigger manual tests workflow via GitHub API
# In CI: uses GITHUB_TOKEN or GH_PAT secret
# Locally: requires GH_PAT environment variable

if [ -z "$GH_PAT" ] && [ -z "$GITHUB_TOKEN" ]; then
  echo "ℹ Skipping workflow trigger: GH_PAT or GITHUB_TOKEN not set"
  exit 0
fi

TOKEN="${GH_PAT:-$GITHUB_TOKEN}"

curl -s -H "Authorization: token $TOKEN" \
     -H "Accept: application/vnd.github+json" \
     -X POST \
     https://api.github.com/repos/Liamhigh/verumceleb/actions/workflows/tests.yml/dispatches \
     -d '{"ref":"main"}' >/dev/null && echo "✓ Triggered Manual Tests (Jest) on main" || echo "⚠ Failed to trigger tests workflow"
