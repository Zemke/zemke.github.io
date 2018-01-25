---
layout:     post
title:      Mac OS X — Use XAMPP’s PHP
date:       2016-02-25 06:00:03
summary:    XAMPP’s PHP version comes with more extensions and features than the one that comes with OS X. Especially when working with Laravel you’ll find yourself in the need of installing a PHP extension. Using XAMPP’s PHP rather than OS X’s default will keep yourself from the hassle of installing a PHP extension.
categories: php macos
---

XAMPP’s PHP version comes with more extensions and features than the one that comes with OS X. Especially when working with Laravel you’ll find yourself in the need of installing a PHP extension. Using XAMPP’s PHP rather than OS X’s default will keep yourself from the hassle of installing a PHP extension.

# That’s how

Paste into ~/.bash_profile

```
export PATH=”/Applications/XAMPP/xamppfiles/bin:$PATH”
```
```
. .bash_profile
```
Restart your terminal.

# Verify it has worked

The following command should link to the PHP in /Applications/XAMPP/xamppfiles/bin

```
which php
```

# Source and further reading
http://stackoverflow.com/a/17192458
