window.addEventListener('load', async () => {
  const query = `{
  lastPushedRepos: viewer {
    repositories(affiliations: OWNER, first: 30, orderBy: {direction: DESC, field: PUSHED_AT}) {
      totalCount
      edges {
        node {
          owner {
            id
          }
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
          primaryLanguage {
            name
          }
          languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                id
                name
              }
            }
            totalSize
            totalCount
          }
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
  createWorkSection(response.pinnedRepos.pinnedItems.nodes);
  createSpecsSection(response.lastPushedRepos.repositories.edges);
});

function createSpecsSection(repos) {
  const data = repos
    .flatMap(repo => repo.node.languages.edges)
    .reduce((acc, curr) => {
      const existing = acc.find(elem => elem.node.id === curr.node.id);
      if (!!existing) {
        existing.size += curr.size;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
    .filter(({size}) => size >= 8000)
    .sort((a, b) => b.size - a.size)
    .map(elem => ({
      language: elem.node,
      size: elem.size,
      repos: repos
        .filter(repo => !!repo.node.languages.edges
          .find(lang => lang.node.id === elem.node.id))
        .map(({node}) => ({name: node.name, url: node.url}))
    }), []);
  document.getElementById('specsContainer').append(...data
    .map(elem => {
      const div = document.createElement('div');
      const h3 = document.createElement('h3');
      h3.textContent = elem.language.name;
      div.appendChild(h3);
      const repoLinkElements = elem.repos.flatMap((repo, idx, arr) => {
        const a = document.createElement('a');
        a.href = repo.url;
        a.target = '_blank';
        a.textContent = repo.name;
        if (idx + 1 !== arr.length) {
          return [a, document.createTextNode(', ')]
        }
        return a;
      });
      const repoLinkContainer = document.createElement('div');
      repoLinkContainer.classList.add('linkContainer');
      repoLinkContainer.append(...repoLinkElements);
      div.appendChild(repoLinkContainer);
      div.style.borderLeftColor = elem.language.color;
      return div;
    }));
}

function createWorkSection(pinnedRepos) {
  const nameAssoc = { // github repo name to localization
    'cwt': 'Crespo’s Worms Tournament',
    'instant-smart-quotes': "Instant Smart Quotes",
    'tippspiel2': "Tippspiel 2",
    'just': "Just",
    'starter-laravel-angular': 'Starter Laravel Angular',
    'starter-node-angular': "Starter Node Angular",
  };

  const imgAssoc = { // github repo id to background image
    'MDEwOlJlcG9zaXRvcnk3ODU0OTQw': '/images/cwt.png',
    'MDEwOlJlcG9zaXRvcnk2NDE2NjQ5Mw==': "/images/ism.jpg",
    'MDEwOlJlcG9zaXRvcnkxMTY0OTA5NjA=': "/images/tippspiel.png",
  };

  const fallbackImages = ['/images/opensource.jpg', '/images/job.png'];
  let lastFallbackImageIdx = 1;

  function createWorkElement(res) {
    const div = document.createElement('div');
    let img;
    if (imgAssoc[res.id]) {
      img = imgAssoc[res.id];
    } else {
      lastFallbackImageIdx = lastFallbackImageIdx === 1 ? 0 : 1;
      img = fallbackImages[lastFallbackImageIdx];
    }
    // RGB is SCSS $main (#393D3F)
    div.style.backgroundImage = `radial-gradient(rgba(57, 61, 63, .4), rgba(57, 61, 63, .9)), url("${img}")`;
    div.classList.add('work');
    const h3 = document.createElement('h3');
    h3.innerText = nameAssoc[res.name] || res.name;
    div.appendChild(h3);
    return div;
  }

  function createWorkOverlay(res) {
    const overlayDiv = document.createElement('div');
    overlayDiv.classList.add('work-description', 'on');
    const textDiv = document.createElement('div');
    textDiv.classList.add('text');
    const closeButtonElement = document.createElement('i');
    closeButtonElement.classList.add('fa', 'fa-5x', 'fa-times');
    closeButtonElement.addEventListener('click', () => overlayDiv.remove());
    document.addEventListener('click', e =>
      e.target.classList.contains('work-description') && e.target.classList.contains('on') && overlayDiv.remove());
    document.addEventListener('keydown', e => e.key === 'Escape' && overlayDiv.remove());
    overlayDiv.appendChild(textDiv);
    textDiv.innerHTML = markyMarkdown(res.object.text, {highlightSyntax: false});
    textDiv.querySelectorAll('a > svg.octicon.octicon-link').forEach(elem => elem.remove());
    const shortDescription = document.createElement('div');
    shortDescription.classList.add('shortDescription');
    shortDescription.textContent = res.description;
    const externalLinks = document.createElement('div');
    externalLinks.classList.add('externalLinks');
    let linkListHtml = `<a target="_blank" href="${res.url}">View on GitHub</a>`;
    if (!!res.homepageUrl) {
      linkListHtml += `&nbsp;&bull;&nbsp;<a target="_blank" href="${res.homepageUrl}">View in Production</a>`
    }
    externalLinks.innerHTML = linkListHtml;
    textDiv.prepend(externalLinks);
    textDiv.prepend(shortDescription);
    textDiv.prepend(closeButtonElement);
    return overlayDiv;
  }

  const elements = pinnedRepos.map(res => {
    const workDiv = createWorkElement(res);
    if (res.object && res.object.text) {
      workDiv.addEventListener('click', () => workDiv.after(createWorkOverlay(res)));
    }
    return workDiv;
  });

  document.getElementById('worksContainer').append(...elements);
}
