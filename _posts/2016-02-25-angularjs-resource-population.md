---
layout:     post
title:      AngularJS $resource Population
date:       2016-02-25 06:00:05
summary:    A profile entity might have a userId attribute. Let’s say you fetch a profile and don’t only want the id of the user the profile belongs to, but the whole user object. How would you populate it neatly? That’s what I came up with
categories: angular
---

A `profile` entity might have a `userId` attribute. Let’s say you fetch a profile and don’t only want the id of the user the profile belongs to, but the whole user object. How would you populate it neatly? That’s what I came up with:

```js
angular.module('app')
  .factory('Profile', function ($resource, User) {
    return $resource('/user/:userId/profile', {
      userId: '@userId'
    }, {
      list: {
        interceptor: {
          response: function (res) {
            if (!res.data) {
              return res.data;
            }

            for (var i in res.data.profiles) {
              (function (i) {
                User.get({userId: res.data.profiles[i].userId}, function (user) {
                  res.data.profiles[i]._user = user;
                })
              })(i);
            }
            return res.data;
          }
        }
      }
    });
  });
```

One advantage is that the factory and its `$resource` take care of the job. Accessing modules keep being decoupled. Also no bloated controllers or services.
