---
title: "Snippet: git ketchup"
summary: "Pull the latest changes in a branch without switching to it."
tags: ['snippet', 'git']
time: '05:12:00'
---

Another git snippet I use frequently, `git ketchup {BRANCH_NAME}`. It’s not `catchup` because that may be a real command. Like [`switcheroo`](/blog/git-switcheroo/), using a silly name (nearly) guarantees there won’t be naming collisions with real git commands.

[.gitconfig]
```bash
[alias]
	ketchup = "!f(){ git fetch origin ${1}:${1}; }; f"
```

I use a graphical user interface (a.k.a. a GUI, mine is [Fork](https://git-fork.com/)) and there’s no right-click option to pull the latest commits from a remote branch into its local equivalent unless it’s already the active branch — as far as I know, anyways. Sometimes I just want to catch up a coworker’s changes to deal with later, without exiting my current branch, you know?

There’s probably a dozen (better) ways to do this but this one works fine for me. 🤷