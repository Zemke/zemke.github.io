window.addEventListener('load', async e => {
  const query = `{
  tenLastPushedRepos: viewer {
    repositories(first: 10, orderBy: {direction: DESC, field: PUSHED_AT}) {
      totalCount
      edges {
        node {
          name
          languages(first: 3) {
            edges {
              node {
                id
                color
                name
              }
              size
            }
            totalSize
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
          primaryLanguage {
            name
          }
          languages(first: 3) {
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
    textDiv.prepend(closeButtonElement);
    return overlayDiv;
  }

  const elements = response.pinnedRepos.pinnedItems.nodes.map(res => {
    const workDiv = createWorkElement(res);
    workDiv.addEventListener('click', () => workDiv.after(createWorkOverlay(res)));
    return workDiv;
  });

  document.getElementById('worksContainer').append(...elements);
});