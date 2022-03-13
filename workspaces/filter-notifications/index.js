const { Octokit } = require("@octokit/core");
const { isMatchWith, isRegExp } = require("lodash");
const filters = require("./config.js");

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

  let count = 0;

  for (const notification of notifications.data) {
    for (const filter of filters) {
      const matched = match(notification, filter);
      if (matched) {
        !dry && (await readAndUnsub(octokit, notification));
        count++;
        break;
      }
    }
  }

  return `marked ${count} notifications as read`;
};

main({ dry: !process.env.CI }).then(console.log).catch(console.error);
