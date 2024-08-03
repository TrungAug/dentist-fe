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
            data: { title: 'Dashboard' }
        })
        .when("/admin/dashboard", {
            templateUrl: "templates/admin-dashboard.html",
            data: { title: 'Dashboard' }
        })
        .when("/admin/doctor", {
            templateUrl: "templates/admin-doctor.html",
            data: { title: 'Thông tin bác sĩ' }
        })
        .when("/admin/doctor-schedule", {
            templateUrl: "templates/admin-doctor-schedule.html",
            data: { title: 'Xếp lịch làm việc' }
        })
        .when("/admin/list-appoinment", {
            templateUrl: "templates/admin-list-appoinment.html",
            data: { title: 'Danh sách cuộc hẹn' }
        })
        .when("/admin/list-service", {
            templateUrl: "templates/admin-list-service.html",
            data: { title: 'Dịch vụ nha khoa' }
        })
        .when("/admin/admin-calendar", {
            templateUrl: "templates/admin-calendar.html",
            data: { title: 'Lên lịch hẹn' }
        })
        .when("/admin/shift", {
            templateUrl: "templates/admin-shift.html",
            data: { title: 'Ca làm việc' }
        })
        .when("/admin/dental-staff", {
            templateUrl: "templates/admin-dental-staff.html",
            data: { title: 'Thông tin nhân viên' }
        })
        .when("/admin/patients", {
            templateUrl: "templates/admin-patients.html",
            data: { title: 'Hồ sơ bệnh nhân' }
        })
        .when("/admin/medicines", {
            templateUrl: "templates/admin-medicines.html",
            data: { title: 'Quản lí thuốc' }
        })
        .when("/booking", {
            templateUrl: "templates/booking.html",
            controller: 'BookingController',
            data: { title: 'Đặt lịch hẹn' }
        })
        .when("/admin/dental-supplies", {
            templateUrl: "templates/admin-list-dental-supplies.html",
            data: { title: 'Vật tư nha khoa' }
        })
        .when("/admin/save-dental-supplies", {
            templateUrl: "templates/admin-save-dental-supplies.html",           
        })
        .when("/admin/distribution-supplies", {
            templateUrl: "templates/admin-list-distribution-supplies.html",
            data: { title: 'Nhà phân phối' }
        })
        .when("/admin/save-distribution-supplies", {
            templateUrl: "templates/admin-save-distribution-supplies.html",
        })
        .when("/admin/list-invoice", {
            templateUrl: "templates/admin-list-invoice.html",
            data: { title: 'Hóa đơn' }
        })
        .when("/admin/ct-results", {
            templateUrl: "templates/admin-ct-results.html",
            data: { title: 'Film chụp CT' }
        })
        .when("/admin/patient-record", {
            templateUrl: "templates/admin-patient-record.html",
            data: { title: 'Lịch sử điều trị' }
        })
        .when("/admin/doctor-calendar", {
            templateUrl: "templates/admin-doctor-calendar.html",
            data: { title: 'Lịch làm của tôi' }
        })
        .when("/admin/create-account", {
            templateUrl: "templates/admin-create-account.html",
            data: { title: 'Tài khoản' }
        })
        .otherwise({
            redirectTo: "templates/home.html"
        })
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
    })
    .service('API', function () {
        //const baseUrl = 'https://graduationthesis-production.up.railway.app/api/v1/auth';
        const baseUrl = 'http://localhost:8081/api/v1/auth';
        return {
            getBaseUrl: function () {
                return baseUrl;
            },
            getHeaders: function () {
                return {
                    Authorization: "Bearer " + localStorage.getItem("accessToken"),
                    "X-Refresh-Token": localStorage.getItem("refreshToken"),
                };
            }
        };
    })
    .service('convertMoneyService', function () {
        function convertNumberToWords(number) {
            var units = ['không', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín'];
            var tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
            var groups = ['', 'ngàn', 'triệu', 'tỷ'];


            function convertGroupOfThreeDigits(num) {
                var result = '';
                var hundred = Math.floor(num / 100);
                var ten = Math.floor((num % 100) / 10);
                var unit = num % 10;

                if (hundred > 0) {
                    result += units[hundred] + ' trăm ';
                }

                if (ten === 1) {
                    result += 'mười ';
                } else if (ten > 1) {
                    result += tens[ten] + ' ';
                }

                if (ten !== 1 && unit > 0) {
                    result += units[unit] + ' ';
                }

                return result.trim();
            }

            if (number === 0) {
                return 'không đồng';
            }

            var words = '';
            var groupIndex = 0;

            while (number > 0) {
                var groupNumber = number % 1000;
                var groupWords = convertGroupOfThreeDigits(groupNumber);

                if (groupWords !== '') {
                    words = groupWords + ' ' + groups[groupIndex] + ' ' + words;
                }

                groupIndex++;
                number = Math.floor(number / 1000);
            }

            return words.trim() + ' đồng';
        }


        this.convertMoneyToWords = function (money) {
            if (isNaN(money) || money < 0 || !Number.isInteger(money)) {
                return 'Số tiền không hợp lệ';
            }


            return convertNumberToWords(money);
        };

    })
    .service('adminBreadcrumbService', function($location, $route) {    
        this.getTitleForUrl = function(url) {
          var route = $route.routes[url];
          return route && route.data && route.data.title || 'Default Title';
        };

        this.generateBreadcrumb = function() {
          let currentUrl = $location.url();
          let breadcrumbSec = $(".breadcrumb");
          let pageTitle = this.getTitleForUrl(currentUrl);
      
          breadcrumbSec.empty(); 
          breadcrumbSec.append(`<li class="breadcrumb-item"><a href="#"><i class="fe fe-home fe-16"></i> Trang chủ</a></li>`);
          breadcrumbSec.append(`<li class="breadcrumb-item"><a href="#!` + currentUrl + `">` + pageTitle + `</a></li>`);
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
        return function (input) {
            if (!input) return "";
            var date = new Date(input);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
        };
    })
    .filter('timeFormat', function () {
        return function (input) {
            if (!input) return "";
            var timeParts = input.split(':');
            if (timeParts.length >= 2) {
                return timeParts[0] + ':' + timeParts[1];
            }
            return input;
        };
    })
    .filter('phoneNumberFormat', function () {
        return function (phoneNumber) {
            if (!phoneNumber) return '';
            phoneNumber = phoneNumber.replace(/\D/g, '');
            return phoneNumber.replace(/(\d{1,3})(\d{3})(\d{3})(\d{3})/, '(+84) $2 $3 $4');
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
                $scope.toggleLoadingIndicator();
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
})

app.run(function ($rootScope, $route) {
    $rootScope.$on('$routeChangeSuccess', function (event, current) {
        var title = current.$$route && current.$$route.data && current.$$route.data.title;
        document.title = title || 'Default Title';
    });
});

