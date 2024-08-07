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
        .when("/admin/medicines", {
            templateUrl: "templates/admin-medicines.html",
        })
        .when("/admin/dental-supplies", {
            templateUrl: "templates/admin-list-dental-supplies.html",
        })
        .when("/admin/save-dental-supplies", {
            templateUrl: "templates/admin-save-dental-supplies.html",
        })
        .when("/admin/distribution-supplies", {
            templateUrl: "templates/admin-list-distribution-supplies.html",
        })
        .when("/admin/save-distribution-supplies", {
            templateUrl: "templates/admin-save-distribution-supplies.html",
        })
        .when("/admin/ct-results", {
            templateUrl: "templates/admin-ct-results.html",
        })
        .otherwise({
            redirectTo: "templates/home.html"
        });
});

app
    .service('processSelect2Service', function () {
        this.processSelect2Data = (values) => {
            if (!Array.isArray(values)) {
                if (typeof values === 'string') {
                    values = [values];
                } else {
                    values = [];
                }
            }
            var processedValues = values.map(function (value) {
                var numericValue = parseInt(value.replace(/\D/g, ''), 10);
                return isNaN(numericValue) ? null : numericValue;
            }).filter(function (value) {
                return value !== null;
            });
            return processedValues;
        }
    })
    .service('TimezoneService', function () {
        this.convertToTimezone = function (date, timezone) {
            return moment(date).tz(timezone).format();
        };

        this.convertFromTimezone = function (date, timezone) {
            return moment.tz(date, timezone).toDate();
        };
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
    })
    .filter('firstFiveChars', function () {
        return function (input) {
            if (input) {
                return input.substring(0, 5); // Lấy 5 ký tự đầu tiên của input
            }
            return '';
        };
    })
    .filter('dateFormat', function () {
        // return function (input) {
        //     if (!input) return "";
        //     var date = new Date(input);
        //     var day = date.getDate();
        //     var month = date.getMonth() + 1;
        //     var year = date.getFullYear();
        //     return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
        // };
        return function (input, reverseOrder) {
            if (!input) return "";
    
            // Parse input date
            var parsedDates = input.map(function(item) {
                return {
                    original: item,
                    date: new Date(item)
                };
            });
    
            // Sort dates descending
            parsedDates.sort(function(a, b) {
                return b.date - a.date;
            });
    
            // Format sorted dates
            var formattedDates = parsedDates.map(function(item) {
                var date = item.date;
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
            });
    
            return formattedDates;
        };
    })
    .filter('timeFormat', function() {
        return function(input) {
          if (!input) return "";
          var timeParts = input.split(':');
          if (timeParts.length >= 2) {
            return timeParts[0] + ':' + timeParts[1];
          }
          return input;
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

            $scope.toggleLoadingIndicator = function () {
                $scope.isLoading = true;
                delay(2000).then(function () {
                    $scope.isLoading = false;
                });
            };

            $rootScope.$on('$routeChangeStart', function () {
                $scope.isLoading = true;
                delay(2000).then(function () {
                    $scope.isLoading = false;
                });
            });

            $scope.$on('getDoctorFilter', function (event, doctorId) {
                $scope.toggleLoadingIndicator(); // Kích hoạt loading khi nhận được sự kiện
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
                        'timeFormat': 'HH:mm', /* Định dạng 24 giờ */
                        'step': 30 /* Bước nhảy của thời gian */
                    });
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});

