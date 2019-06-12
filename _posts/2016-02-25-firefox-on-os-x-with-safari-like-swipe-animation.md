---
layout:     post
title:      Firefox on OS X with Safari-like swipe animation
summary:    One of the benefits of using Safari on OS X is that it beautifully integrates with the operating system. Occasionally it went far enough that I considered to switch from Firefox to Safari. Of course I have never done that, because Firefox is great. Still, Safari comes with the smoothest experience on OS X. For instance it has that neat swipe animation when you go back or forth using your Magic Mouse or Trackpad. On Firefox the gesture works as well, but it doesn’t fade the swipe animation in.
categories: misc
---

{{page.summary}}

# My source

I found [this issue](https://bugzilla.mozilla.org/show_bug.cgi?id=678392) in the Mozilla bug tracker. I wondered the status was “resolved fixed”, because obviously this wouldn’t work with my Firefox and I’m on the beta update channel and I also tried it with Aurora (nightly builds) until I read further on. A configuration is required to enable the swipe animation.

# Here is how it works

Enter `about:config` in your  address bar and search for `browser.snapshots.limit`. Set the value to something non-zero.

![Firefox config](/images/posts/firefox-on-os-x-with-safari-like-swipe-animation/firefox-config.png)

If it doesn’t work, make sure the gesture is enabled at all. It happened to me that when I upgraded to Mavericks the gesture would automatically turn off. Go to your System Preferences and make sure it's enabled.

![Mac system preferences](/images/posts/firefox-on-os-x-with-safari-like-swipe-animation/mac-system-preferences.png)

# What it still lacks at

The animation itself is no worse than Safari’s. Though it’s probably with reason that it’s not enabled by default.

* If there’s actually no option to go back you can still do that gesture and if you’re “aggressive” enough it will kind of refresh the page. Same when going forth.
* Safari reacts immediately when you start that gesture. In Firefox you do a good amount of swiping before the animation actually starts.

But it will become better. On Aurora both issues seem fixed. My Firefox is currently 26, Aurora is 27.0a2. In Aurora they’ve also already implemented the vertical bumps when you hit the top or end of the page. It’s probably best known from iOS, but also many Apple apps on OS X do it—if not all.

![Bottom bump](/images/posts/firefox-on-os-x-with-safari-like-swipe-animation/bottom-bump.png)

# How do other browsers do?

Google Chrome and Maxthon have an arrow appearing. It fades in and gets bigger as you swipe.

![Arrow swipe](/images/posts/firefox-on-os-x-with-safari-like-swipe-animation/arrow-swipe.png)

Opera Next has no animation, but the gesture works.
