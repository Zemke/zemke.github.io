---
layout:     post
title:      jQuery DOM Manipulation after AngularJS Routing
summary:    You want to manipulate the DOM with jQuery on a new partial AngularJS is rendering? That’s not so easily done as you have to manipulate after the routing. With this pro tip I’ll show you how that works.
categories: angularjs
---

{{page.summary}}

The answer is: Directives.

And this is our directive:

```javascript
angular.module('eliteLeagueApp').directive('quotesSlider', function ($http) {
  return {
    // Restrict it to be an attribute in this case.
    restrict: 'A',
    link: function ($scope, element, attrs) {
      $http.get('/api/awesomeQuotes').success(function (awesomeQuotes) {
        $scope.awesomeQuotes = awesomeQuotes;

        $scope.$watch('awesomeQuotes', function () {
          $(element).slick({
            dots: true,
            autoplay: true,
            arrows: false
          });
        });
      });
    }
  }
});
```
And this is how it’s bound to the HTML element:

```html
<div quotes-slider>
  <div ng-repeat='awesomeQuote in awesomeQuotes'>
    {{awesomeQuote.message}} by {{awesomeQuote.name}}
  </div>
</div>
```

Easy enough. `$http.get()` will fetch something from your back-end asynchronously hence we use `$scope.$watch` to look out for changes on this data. `$(element).slick()` is the actual DOM manipulation that will be triggered once `$scope.awesomeQuotes` has changed. By the way, [Slick](http://kenwheeler.github.io/slick/) is an awesome tool for making nice carousels.
