angular.module('scroll', []).directive('whenScrolled', function () {
    return function (scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function () {
            if (raw.scrollTop > scope.memoryScrollTop)
                scope.$apply(attr.whenScrolled);
            scope.memoryScrollTop = raw.scrollTop;
        });
    };
});

