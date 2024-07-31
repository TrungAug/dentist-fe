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
        .when("/confirmation", {
            templateUrl: "templates/confirmation.html",
        })
        .when("/about", {
            templateUrl: "templates/about.html",
        })
        .when("/admin", {
            templateUrl: "templates/admin-dashboard.html",
        })
        .when("/admin/dashboard", {
            templateUrl: "templates/admin-dashboard.html",
        })
        .when("/admin/doctor", {
            templateUrl: "templates/admin-doctor.html",
        })
        .when("/admin/doctor-schedule", {
            templateUrl: "templates/admin-doctor-schedule.html",
        })
        .when("/admin/list-appoinment", {
            templateUrl: "templates/admin-list-appoinment.html",
        })
        .when("/admin/list-service", {
            templateUrl: "templates/admin-list-service.html",
        })
        .when("/admin/admin-calendar", {
            templateUrl: "templates/admin-calendar.html",
        })
        .when("/admin/shift", {
            templateUrl: "templates/admin-shift.html",
        })
        .when("/admin/dental-staff", {
            templateUrl: "templates/admin-dental-staff.html",
        })
        .when("/admin/patients", {
            templateUrl: "templates/admin-patients.html",
        })
        .otherwise({
            redirectTo: "templates/home.html"
        });
});
app
    .filter('truncateWordsHTML', function () {
        return function (input, limit) {
            if (!input) return '';

            let words = input.split(' ');
            if (words.length <= limit) {
                return input;
            }
            return words.slice(0, limit).join(' ') + '...';
        };
    })
    .filter('formatPrice', function () {
        return function (input) {
            if (!isNaN(input)) {
                var formattedPrice = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return formattedPrice + ' VND';
            } else {
                return input;
            }
        };
    });

app.directive('loadingIndicator', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        //template: '<div class="loading-indicator" ng-show="isLoading">Đang tải...</div>', 
        templateUrl: '/templates/loading-indicator.html',
        controller: function ($scope, $rootScope) {
            $scope.isLoading = false;

            function delay(ms) {
                return $timeout(function () {
                    // Empty callback, or you can do additional tasks here
                }, ms);
            }

            $rootScope.$on('$routeChangeStart', function () {
                $scope.isLoading = true;
                delay(2000).then(function () {
                    $scope.isLoading = false;
                });
            });
        }
    };
});

app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    $('.time-input').timepicker({
                        'scrollDefault': 'now',
                        'zindex': '9999', /* fix modal open */
                        'timeFormat': 'H:i', /* Định dạng 24 giờ */
                        'step': 30 /* Bước nhảy của thời gian */
                    });
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});
