const https = require('https');

let query = `{
  lastPushedRepos: viewer {
    repositories(first: 100, orderBy: {direction: DESC, field: PUSHED_AT}, privacy: PUBLIC) {
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
  },
`;

const PIN = ["cwt", "waaas", "waai", "ml", "just", "tippspiel2", "instant-smart-quotes", "starter-laravel-angular",]

for (let i = 0; i < PIN.length; i++) {
  query += `
  pinnedRepos${i}: viewer {
    repository(name: "${PIN[i]}") {
      id name description url homepageUrl
      object(expression: "HEAD:README.md") { ... on Blob { text } }
    }
  },
`
}

query += "}";

const data = new TextEncoder().encode(JSON.stringify({query}))

const options = {
  hostname: 'api.github.com',
  path: '/graphql',
  port: 443,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'user-agent': 'node',
    'Authorization': "bearer " + process.env.GITHUB_TOKEN,
  }
}

const req = https.request(options, res => {
  let buffer = '';
  res.on('data', d => {
    buffer += d;
  })
  res.on('end', () => {
    const response = JSON.parse(buffer);
    let fin = JSON.parse(JSON.stringify({lastPushedRepos: response.data.lastPushedRepos}))
    fin.pinnedRepos = []
    for (let i = 0; i < PIN.length; i++) {
      fin.pinnedRepos.push(response.data["pinnedRepos" + i].repository);
    }
    console.log(JSON.stringify(fin))
  });
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()

