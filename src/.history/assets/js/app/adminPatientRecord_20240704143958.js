console.log("AdminCalendar");
app.controller('AdminCalendar', function ($scope, $http, $rootScope, $location, $timeout, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),

    }
    //code here
    // $scope.dropdownOpen = false;

    // $scope.customers = [
    //     { name: 'John Doe', email: 'john@example.com' },
    //     { name: 'Jane Smith', email: 'jane@example.com' },
    //     { name: 'Michael Brown', email: 'michael@example.com' }
    // ];

    // $scope.toggleDropdown = function() {
    //     $scope.dropdownOpen = !$scope.dropdownOpen;
    // };

})

