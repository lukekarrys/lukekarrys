// https://docs.github.com/en/github-ae@latest/rest/reference/activity#list-notifications-for-the-authenticated-user
module.exports = {
  deps: {
    reason: "review_requested",
    subject: {
      title: /^(deps: |chore: update )/,
      type: "PullRequest",
    },
    repository: {
      owner: {
        login: "npm",
      },
    },
  },
  release: {
    reason: "review_requested",
    subject: {
      title: /^chore: release /,
      type: "PullRequest",
    },
    repository: {
      owner: {
        login: "npm",
      },
    },
  },
};
