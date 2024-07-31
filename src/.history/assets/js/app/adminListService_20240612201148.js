console.log("AdminListService");
app.controller('AdminListService', function ($scope, $http, $rootScope, $location,$timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.infoServiceRelative = []
    $scope.listInfo = function () {
        $http.get(url + 'service').then(response => {
            $scope.infoServiceRelative = response.data
            console.log("$scope.infoServiceRelative", response.data);                  
        }).catch(error => {
            console.log("error", error);
        })
    }




    $timeout(function() {
        $('#dataTable-list-service').DataTable({
            autoWidth: true,
            "lengthMenu": [
                [16, 32, 64, -1],
                [16, 32, 64, "All"]
            ]
        });
    }, 0);

    $scope.listInfo();
})