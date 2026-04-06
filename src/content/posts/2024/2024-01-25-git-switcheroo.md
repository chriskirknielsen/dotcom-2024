---
title: 'Snippet: git switcheroo'
summary: Move a commit from one branch to another.
tags: [snippet, git]
---

I aliased a git command to move commits from one branch to another (usually `main` to `dev`). A bad idea? 🤷

[.gitconfig]
```bash
[alias]
switcheroo = "!f(){ git checkout ${3}; git cherry-pick ${1}; git checkout ${2}; git reset --hard HEAD~1; }; f"
```

Usage: `git switcheroo {COMMIT HASH} {SOURCE BRANCH} {TARGET BRANCH}`
➡️ e.g: `git switcheroo 7edaf7 main dev`

{{ callout }}
Originally posted on Twitter on 23 September 2022. Figured it’d be worth its own post here.
{{ /callout }}