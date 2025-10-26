#!/usr/bin/env bash
: "${GH_PAT:?run: read -s GH_PAT && export GH_PAT}"
curl -s -H "Authorization: token $GH_PAT" \
     -H "Accept: application/vnd.github+json" \
     -X POST \
     https://api.github.com/repos/Liamhigh/verumceleb/actions/workflows/tests.yml/dispatches \
     -d '{"ref":"main"}' >/dev/null && echo "Triggered Manual Tests (Jest) on main"
