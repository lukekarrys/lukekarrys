// https://docs.github.com/en/rest/reference/activity#list-notifications-for-the-authenticated-user
module.exports = Object.entries({
  deps: {
    reason: "review_requested",
    subject: {
      title: /^(deps:|chore: update) /,
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
});
