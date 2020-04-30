---
layout:     post
title:      GitHub Actions Deployment to DigitalOcean
summary:    Deploy to DigitalOcean when pushing a Git tag to GitHub
categories: misc
---

{{page.summary}}

# Workflow

There are five GitHub Actions that go into deploying to DigitalOcean.
The workflow is as follows:

1. The project source code is checked out
2. Setup Java SDK 11 and create deployable JAR with Maven
3. Optionally create release on GitHub
4. Optionally add release artifact to previously created release on GitHub
5. Using SCP, copy the release artifact build in step 3 to DigitalOcean

Step 2 may needs to be adapted to whatever gives your the deployable artifact that’s to be deployed to DigitalOcean.

The GitHub Actions I have used for this are

1. [actions/checkout](https://github.com/actions/checkout)
2. [actions/setup-java](https://github.com/actions/setup-java)
3. [actions/create-release](https://github.com/actions/create-release)
4. [actions/upload-release-asset](https://github.com/actions/upload-release-asset)
5. [appleboy/scp-action](https://github.com/appleboy/scp-action)

# Configuration

{% raw %}
```yaml
name: release
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    name: Release and Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Set up JDK 11
        uses: actions/setup-java@v1
        with:
          java-version: 11
      - name: mvn -B clean package -DskipTests
        run: mvn -B clean package -DskipTests
      - name: Create GitHub Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: ${{ github.ref }}
          draft: false
          prerelease: false
      - name: Add Artifact to GitHub Release
        id: upload-release-asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./cwt-spring/target/cwt-spring-SNAPSHOT.jar
          asset_name: cwt-spring.jar
          asset_content_type: application/java-archive
      - name: SCP to Ocean
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.ocean_host }}
          username: ${{ secrets.ocean_user }}
          password: ${{ secrets.ocean_pass }}
          port: ${{ secrets.ocean_port }}
          source: "cwt-spring/target/cwt-spring-SNAPSHOT.jar"
          strip_components: 2
          target: "/var/github-release"
```
{% endraw %}

## SSH secrets

From the repository page in GitHub under “Settings” and “Secrets” you can set the secrets `ocean_port`, `ocean_pass`, `ocean_user`, `ocean_host` for your SSH connection to DigitalOcean

# Droplet listen to artifact creation

If everything's gone right, an artifact which might be a directory or a single deployable file has been copied to your DigitalOcean Droplet.

A service running in the background of your droplet will listen to the creation of that artifact and once it's triggered, will perform the actual deployment.


## systemd

```
[Unit]
Description=Watch for CWT artifacts
After=syslog.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=/usr/local/bin/cwt-deploy-watch

[Install]
WantedBy=multi-user.target
```

### `cwt-deploy-watch`

```sh
#!/bin/bash

/usr/bin/inotifywait -m -e close_write /var/github-release |
  while read dir action file; do
    if [[ "$file" == "cwt-spring-SNAPSHOT.jar" ]]; then
      echo "cwt-spring-SNAPSHOT.jar received"
      systemctl stop cwt.service
      mv -v "/var/github-release/${file}" /var/cwt/cwt.jar
      systemctl daemon-reload
      systemctl start cwt.service
    fi
  done
```

Adapt the script to whatever needs to be done for your particular deployment.
