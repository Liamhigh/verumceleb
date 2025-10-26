#!/usr/bin/env bash
: "${GH_PAT:?run: read -s GH_PAT && export GH_PAT}"
curl -s -H "Authorization: token $GH_PAT" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/Liamhigh/verumceleb/actions/runs?per_page=5 \
| jq -r '.workflow_runs[] | .name+" — "+.status+"/"+(.conclusion//"pending")'
