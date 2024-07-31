console.log("home page loaded")
let app = angular.module("dentisHub", ["ngRoute"]);
let BASE_URL = "http://localhost:8080/";
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: 'templates/home.html',
        })
        .when("/home", {
            templateUrl: 'templates/home.html',
        })
        .when("/index", {
            templateUrl: 'templates/home.html',
        })
        .when("/login", {
            templateUrl: 'templates/login.html',
        })
        .when("/register", {
            templateUrl: 'templates/register.html',
        })
        .when("/contact", {
            templateUrl: 'templates/contact.html',
        })
        .when("/blog-single", {
            templateUrl: "templates/blog-single.html",
        })
        .when("/blog-sidebar", {
            templateUrl: "templates/blog-sidebar.html",
        })
        .when("/confirmation", {
            templateUrl: "templates/confirmation.html",
        })
        .when("/department", {
            templateUrl: "templates/department.html",
        })
        .when("/doctor-single/:id", {
            templateUrl: "templates/doctor-single.html",
        })
        .when("/department-single/:id", {
            templateUrl: "templates/department-single.html",
        })
        .when("/doctor", {
            templateUrl: "templates/doctor.html",
        })
        .when("/documentation", {
            templateUrl: "templates/documentation.html",
        })
        .when("/service", {
            templateUrl: "templates/service.html",
        })
        .when("/appoinment", {
            templateUrl: "templates/appoinment.html",
        })
        .when("/about", {
            templateUrl: "templates/about.html",
        })
        .when("/admin", {
            templateUrl: "templates/admin-dashboard.html",
        })
        .otherwise({
            redirectTo: "templates/home.html"
        });
});
app.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if ($location.path().indexOf('admin') !== -1) {
            console.log("adminaaaaaaaaaaaaaaaaaaaaa");
            $rootScope.showHeader = false;
            $rootScope.showFooter = false;
        } else {
            console.log("okkkkkkkkkkkkkkkkkkkkkkkk");
            $rootScope.showHeader = true;
            $rootScope.showFooter = true;
        }
    });
}]);
app.controller('MainController', ['$scope', function ($scope) {
    // Initialize showHeader and showFooter
    $scope.showHeader = true;
    $scope.showFooter = true;
}]);
