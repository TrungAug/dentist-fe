app.controller('AdminListAppoinment', function ($scope, $http, $rootScope, $location,$timeout) {
    let url = "http://localhost:8080/api/v1"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.selectTab=(tab,$event)=>{
        $event.preventDefault()

    }
   

    $timeout(function() {
        $('#dataTable-list-appoinment').DataTable({
            autoWidth: true,
            "lengthMenu": [
                [16, 32, 64, -1],
                [16, 32, 64, "All"]
            ]
        });
    }, 0);
})