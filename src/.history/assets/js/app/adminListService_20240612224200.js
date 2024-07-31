console.log("AdminListService");
app.controller('AdminListService', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    // $scope.listServiceFromDB = []
    // $scope.listServiceTypeDB = []
    $scope.listServiceInfo = () => {
        $http.get(url + '/service').then(response => {
            $scope.listServiceFromDB = response.data
            //console.log("$scope.listServiceFromDB", response.data);

            $(document).ready(function () {
                $('#dataTable-list-service').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "All"]
                    ],
                    language: {
                        sProcessing: "Đang xử lý...",
                        sLengthMenu: "Hiển thị _MENU_ mục",
                        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
                        sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                        sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                        sInfoFiltered: "(được lọc từ _MAX_ mục)",
                        sInfoPostFix: "",
                        sSearch: "Tìm kiếm:",
                        sUrl: "",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });
        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.listServiceTypeInfo = () => {
        $http.get(url + '/service-type').then(response => {
            $scope.listServiceTypeDB = response.data
            //console.log(" $scope.listServiceTypeDB ", $scope.listServiceTypeDB);
        }).catch(error => {
            console.log(("error", error));
        })
    }
    $scope.crudService = () => {       
        $scope.createService = () => {
           
        }
        $scope.updateService = () => {
           
        }
    }



    // $timeout(function () {
    //     $('#dataTable-list-service').DataTable({
    //         autoWidth: true,
    //         "lengthMenu": [
    //             [16, 32, 64, -1],
    //             [16, 32, 64, "All"]
    //         ]
    //     });
    // }, 0);

    $scope.listServiceInfo();
    $scope.listServiceTypeInfo();
    $scope.crudService();
})