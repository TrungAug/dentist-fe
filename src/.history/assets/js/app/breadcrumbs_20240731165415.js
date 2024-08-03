angular.module('services.breadcrumbs', [])
    .service('breadcrumbs', ['$rootScope', '$location', '$route', function($rootScope, $location, $route) {
        console.log("services.breadcrumbs",services.breadcrumbs);
        var breadcrumbs = [];
        var routes = $route.routes;

        function generateBreadcrumbs() {
            breadcrumbs = [];
            var pathElements = $location.path().split('/'),
                path = '';

            function getRoute(route) {
                angular.forEach($route.current.params, function(value, key) {
                    var re = new RegExp(value);
                    route = route.replace(re, ':' + key);
                });
                return route;
            }

            if (pathElements[1] == '') delete pathElements[1];
            angular.forEach(pathElements, function(el) {
                path += path === '/' ? el : '/' + el;
                var route = getRoute(path);
                if (routes[route] && routes[route].label) {
                    breadcrumbs.push({ label: routes[route].label, path: path });
                }
            });
        }

        $rootScope.$on('$routeChangeSuccess', function() {
            generateBreadcrumbs();
        });

        this.getAll = function() {
            return breadcrumbs;
        };

        this.getFirst = function() {
            return breadcrumbs[0] || {};
        };

    }]);
