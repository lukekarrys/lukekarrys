const { Octokit } = require("@octokit/core");
const { isMatchWith, isRegExp } = require("lodash");

// https://docs.github.com/en/github-ae@latest/rest/reference/activity#list-notifications-for-the-authenticated-user
const FILTERS = {
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

const match = (notification, [name, filter]) =>
  isMatchWith(notification, filter, (obj, source) => {
    if (isRegExp(source)) {
      return source.test(obj);
    }
  }) && name;

const readAndUnsub = async (octokit, notification) => {
  const opts = { thread_id: notification.id };
  await octokit.request("PATCH /notifications/threads/{thread_id}", opts);
  await octokit.request(
    "DELETE /notifications/threads/{thread_id}/subscription",
    opts
  );
};

const main = async ({ dry = true } = {}) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const notifications = await octokit.request("GET /notifications", {
    per_page: 100,
  });
  const filters = Object.entries(FILTERS);

  let count = 0;

  for (const notification of notifications.data) {
    const title = `${notification.repository?.full_name}= ${notification.subject?.title}`;
    console.log(title);

    for (const filter of filters) {
      const matched = match(notification, filter);
      if (matched) {
        !dry && (await readAndUnsub(octokit, notification));
        console.log(`  --> match: ${matched}`);
        count++;
        break;
      }
    }
  }

  return `marked ${count} notifications as read`;
};

main({ dry: !process.env.CI }).then(console.log).catch(console.error);
