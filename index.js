/* Ultra lightweight Github REST Client */

function generateAPI(baseUrl, defaults = {}) {
  const callable = () => {};
  callable.url = baseUrl;
  return new Proxy(callable, {
    get({ url }, propKey) {
      const method = propKey.toUpperCase();
      if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        return (data, overrides = {}) => {
          const payload = { method, ...defaults, ...overrides };
          switch (method) {
            case "GET": {
              if (data) url = `${url}?${new URLSearchParams(data)}`;
              break;
            }
            case "POST":
            case "PUT":
            case "PATCH": {
              payload.body = JSON.stringify(data);
            }
          }
          console.log(`Calling: ${url}`);
          console.log("payload", payload);
          return fetch(url, payload).then((d) => d.json());
        };
      }
      return generateAPI(`${url}/${propKey}`, defaults);
    },
  });
}

const token = "github-token-here";
const githubClient = generateAPI("https://api.github.com", {
  headers: {
    "User-Agent": "xyz",
    Authorization: `bearer ${token}`,
  },
});

async function getRepo() {
  /* GET /repos/{owner}/{repo} */
  return githubClient.repos.rahmatagungj.analytics.get();
}

async function generateRepoFromTemplate({ template, repoName }) {
  /* POST /repos/{template_owner}/{template_repo}/generate */
  return githubClient.repos[`${template}`].generate.post({ name: repoName });
}

getRepo().then((repoInfo) => {
  console.log("repo", repoInfo);
});
