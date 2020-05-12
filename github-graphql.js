const query = `{
  lastPushedRepos: viewer {
    repositories(affiliations: OWNER, first: 30, orderBy: {direction: DESC, field: PUSHED_AT}) {
      edges {
        node {
          name
          url
          languages(first: 4, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              node {
                id
                color
                name
              }
              size
            }
          }
        }
      }
    }
  }
  pinnedRepos: viewer {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          id
          name
          description
          url
          homepageUrl
          object(expression: "master:README.md") {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}
`;

(async () => {
  let response;
  try {
    response = (await fetch("http://localhost:8080/github-api", {
      method: 'POST',
      body: JSON.stringify({query}),
      headers: [['Content-Type', 'application/json']]
    }).then(res => res.json())).data;
    window.localStorage.setItem('github-api', JSON.stringify(response));
  } catch (e) {
    console.warn('github response is not current, falling back to local storage');
    response = JSON.parse(window.localStorage.getItem('github-api'));
  }

})();
