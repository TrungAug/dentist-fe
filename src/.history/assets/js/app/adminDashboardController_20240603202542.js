console.log("AdminDashboardController");
app.controller('AdminDashboardController', function ($scope, $http, $rootScope, $location) {
    let url = "http://localhost:8080/api/v1"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }

   
    $scope.chartArea = function () {
        

    }

    $scope.chartBar = function () {
       
    }



    $scope.userInfo();
    $scope.chartArea();
    $scope.chartBar();
})

