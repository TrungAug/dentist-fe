console.log("AdminListService");
app.controller('AdminListService', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    $scope.listServiceFromDB = [];
    //code here
    
    $scope.listServiceInfo = () => {
        $http.get(url + '/service').then(response => {
            $scope.listServiceFromDB = response.data
            $scope.listServiceFromDB=sortById($scope.listServiceFromDB)
            //console.log("$scope.listServiceFromDB", response.data);
            if ($.fn.DataTable.isDataTable('#dataTable-list-service')) {
                $('#dataTable-list-service').DataTable().clear().destroy();
            }
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
                $scope.$apply()
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
        $scope.viewMode = ""
        $scope.formService = {
            serviceId: -1,
            serviceName: '',
            price: 0,
            timeEstimate: 0,
            serviceTypeId: "",
            description: '',
            deleted: false
        };
        $scope.fetchServices = (newData) => {      
            // var table = $('#dataTable-list-service').DataTable();
            // table.row.add(newData).draw();
            
            var table = new DataTable('#dataTable-list-service');
            table.row.add(newData).draw();
            console.log("them 1 dong");
        };
        $scope.modalMode = (view, service) => {
            $scope.viewMode = view          
            if (service != "") {
                $scope.formService = angular.copy(service);              
                $scope.formService.serviceTypeId = service.serviceType?service.serviceType.service_TypeId:-1
            }           
            console.log("$scope.formService ", service);
        }
        $scope.resetForm = () => {
            $scope.formService = {
                serviceName: '',
                price: 0,
                timeEstimate: 0,
                serviceTypeId: '',
                description: ''
            };
        }
        $scope.refreshData = () => {
            $scope.listServiceInfo()
        }
        $scope.validation = () => {
            if ($scope.formService.serviceName == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập tên dịch vụ!",
                    icon: "error"
                })
                return
            }
            if ($scope.formService.serviceTypeId == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn loại dịch vụ!",
                    icon: "error"
                })
                return
            }
            if ($scope.formService.price < 0 || $scope.formService.timeEstimate < 0) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Không được nhập số âm!",
                    icon: "error"
                })
                return
            }
        }
        $scope.createService = () => {
            $scope.validation()
            var requsetServiceJSON = angular.toJson($scope.formService)
            // console.log("requsetServiceJSON",requsetServiceJSON);
            $http.post(url + '/service', requsetServiceJSON).then(response => {
                Swal.fire({
                    title: "Thành công!",
                    html: "Đã thêm dịch vụ thành công!",
                    icon: "success"
                })
                $scope.resetForm()
                $scope.listServiceInfo()
            }).catch(err => {
                Swal.fire({
                    title: "Thất bại!",
                    html: '<p class="text-danger">Xảy ra lỗi!</p>',
                    icon: "error"
                })
            })
        }
        $scope.updateService = () => {
            $scope.validation()
            var requsetServiceJSON = angular.toJson($scope.formService)
            var serviceId = $scope.formService.serviceId
            // console.log("serviceId",serviceId);
            // console.log("requsetServiceJSON",$scope.formService);
            $http.put(url + '/service/' + serviceId, requsetServiceJSON).then(response => {
                Swal.fire({
                    title: "Thành công!",
                    html: "Cập nhật dịch vụ thành công!",
                    icon: "success"
                })
                $('#serviceModal').modal('hide');
            }).catch(error => {
                Swal.fire({
                    title: "Thất bại!",
                    html: '<p class="text-danger">Xảy ra lỗi!</p>',
                    icon: "error"
                })
            })

        }
        $scope.deleteService = (service, $event) => {
            $event.preventDefault()
            console.log("delete service", service)
            var serviceId = service.serviceId
            Swal.fire({
                text: "Bạn có muốn xóa dịch vụ ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/sort-delete-service/' + serviceId).then(respone => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        })
                    }).catch(err => {
                        Swal.fire({
                            title: "Thất bại!",
                            html: '<p class="text-danger">Xảy ra lỗi!</p>',
                            icon: "error"
                        })
                    })
                }
            })

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
    function sortById(data) {
        return data.sort((a, b) => b.id - a.id);
    }
    $scope.listServiceInfo();
    $scope.listServiceTypeInfo();
    $scope.crudService();
})