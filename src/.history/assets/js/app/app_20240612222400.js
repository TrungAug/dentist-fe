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
app.directive('formatPriceInput', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$formatters.push(function (val) {
                return $filter('currency')(val, '', 0); // Định dạng giá trị khi hiển thị
            });

            ngModelCtrl.$parsers.push(function (val) {
                var clean = val.replace(/[^0-9]/g, ''); // Xóa bỏ các ký tự không phải số
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('blur', function () {
                var formattedValue = $filter('currency')(ngModelCtrl.$modelValue, '', 0);
                element.val(formattedValue);
            });

            element.bind('focus', function () {
                element.val(ngModelCtrl.$modelValue);
            });
        }
    };
});
