---
layout:     post
title:      Replacing HTML with Jade in Express applications
summary:    Jade is great. You can progress faster and that of course is valuable. So, here is how you can make your Express application one that utilizes the strengths of Jade.
categories: jade express
---

{{page.summary}}

Add Jade to your project.

```
npm install --save jade
```

First of all, get Express to know that you actually want to use Jade now. Therefor go to the Express configuration file of your project. It’s most of the times located in the root directory of your project and named either `app.js` or `server.js`. Just add these lines:

```js
var path = require('path');
app.set('views', path.join(__dirname, '/views')); // dir of where your view files are
app.set('view engine', 'jade');
```

Your routing changes. You should now render stuff.

```js
app.get('*', function(req, res) {
  res.render('index');
});
```

You see, it’s just `index`. This is it. You’ve told Express that your view files are in `/views` and from there on it will look for the file. You’ve also told it that files should be Jade files, so it expects `index` to be an `index.jade` file.
A sophisticated approach of course should include checks for errors during rendering. Please refer to the Express API. Also adjust your routing   according to what routes you need.

Also your HTML files should now become Jade files and contain Jade code rather than HTML markup. Here’s an example.


```html
<div class="jumbotron text-center">
    <h1>Geek City</h1>
    <p>I’m all nerdy</p>
</div>
```
becomes
```
.jumbotron.text-center
  h1 Geek City
  p I’m all nerdy
```

You can take advantage of the [HTML 2 Jade Converter](http://html2jade.aaron-powell.com).

You’re basically doing nothing more than just telling Express that you want to use Jade, where those Jade files are and that you want to render them.

Please mind the trap when using AngularJS and HTML5 mode URLs. Refer to [this page](http://scotch.io/quick-tips/js/angular/pretty-urls-in-angularjs-removing-the-hashtag) for more information on that.

[Here’s a demo of me replacing HTML with Jade.](https://github.com/Zemke/starter-node-angular/commit/bd5be3e3d0dbc498d234e0e04c436aa17a737f1c?diff=unified)
