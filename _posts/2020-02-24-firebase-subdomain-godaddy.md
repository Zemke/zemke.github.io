---
layout:     post
title:      Firebase Subdomain on GoDaddy
summary:    How to register a subdomain to an existing domain on GoDaddy to work for Firebase Hosting.
categories: misc
---

{{page.summary}}

# Firebase Console

In your Firebase Console under Hosting add a custom domain. Enter the full domain name you wish to have.

Make sure you’re in quick setup mode. You’re given two record type A entries both of which you’ll set in the next step on GoDaddy.

![Firebase add custom domain](/images/posts/2020-02-24-firebase-subdomain-godaddy/firebase.png)

# GoDaddy Manage DNS

Go to managing DNS for the domain you want to add the subdomain to. Your goal is the screen with the DNS records.
There are already some entries and you’re going to add the two that you were given above from Firebase.

Add a DNS record. Type A, host is just the subdomain portion of your domain. For instance if you domain was sub.domain.com then sub is the host. “Points to” is the value you were given from Firebase which should be an IP. The default value for TTL can be kept.

Do both of that for the A records from Firebase.

That’s it, after some time the domain should be reachable without SSL and after some more time with SSL as well. Maybe you will be getting a security issue from your Browser in the beginning, but that should go away after some time. Can take up to 24 hours according to Firebase.
