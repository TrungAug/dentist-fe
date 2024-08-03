
app.controller('AdminListDentalSupplies', function ($scope, $http, $rootScope, $location, $timeout,API) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    //code here
    $scope.listDistributionSuppliesFormDB = [];
    $scope.listDentalSuppliesFromDB = [];
    $scope.editDentalSupplies = [];
    //code here
    //clear form dental supplies
    $scope.clearFormDentalSuppliesFormDB = () => {
        $scope.suppliesName = ''

        $scope.description = ''

        $scope.distributionSuppliesId = ''
    }


    //dental suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.listDentalSuppliesFromDB = () => {
        $http.get(url + '/dental-supplies-except-deleted').then(response => {
            $scope.listDentalSuppliesFromDB = response.data
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

    //create dental suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.createDentalSuppliesFromDB = () => {
        $scope.errorSuppliesName = false;
        $scope.errorDistributionSupplies = false;
        if ($scope.suppliesName == '' || $scope.suppliesName == undefined) {
            $scope.errorSuppliesName = true;
        } else {
            $scope.errorSuppliesName = false;
        }
        if ($scope.distributionSuppliesId == '' || $scope.distributionSuppliesId == undefined) {
            $scope.errorDistributionSupplies = true;
        } else {

            $scope.errorDistributionSupplies = false;
        }
        if ($scope.errorSuppliesName || $scope.errorDistributionSupplies) {
            return;
        }
        var DentalSuppliesRequest = {
            suppliesName: $scope.suppliesName,

            description: $scope.description,

            distributionSuppliesId: parseInt($scope.distributionSuppliesId, 10)
        }
        $http.post(url + '/dental-supplies', angular.toJson(DentalSuppliesRequest)).then(response => {
            
            Swal.fire({
                title: "Thành công!",
                html: "Đã thêm vật tư thành công!",
                icon: "success"
            });
            $scope.clearFormDentalSuppliesFormDB();
        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            });
            console.log("error", error);
        });
    }
    //delete dental suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.deleteDentalSupplies = (d) => {
       
        Swal.fire({
            title: "Bạn có chắc?",
            text: "Bạn có muốn xóa " + d.suppliesName + " này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete(url + '/soft-delete-dental-supplies/' + d.suppliesId).then(response => {
                    
                    $(document).ready(function () {
                        $('.dentalSupplies_' + d.suppliesId).remove();
                    });
                }).catch(error => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Xảy ra lỗi!</p>',
                        icon: "error"
                    })
                    console.log("error", error);
                })
                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
            }
        });
    }

    $scope.editDentalSupply = (d) => {
        //$scope.editDentalSupplies = angular.copy(d);
        $http.get(url + '/dental-supplies-id/' + d.suppliesId).then(response => {
            
            $scope.editDentalSupplies = response.data

        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            });
            console.log("error", error);
        });
    }
    //update dental supplyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    $scope.updateDentalSupply = () => {
        var DentalSuppliesRequest = {
            suppliesName: $scope.editDentalSupplies.suppliesName,

            description: $scope.editDentalSupplies.description,

            distributionSuppliesId: parseInt($scope.editDentalSupplies.distributionSupplies.distributionId, 10)
        }
        $http.put(url + '/dental-supplies/' + $scope.editDentalSupplies.suppliesId, angular.toJson(DentalSuppliesRequest)).then(response => {
         
            $('#dentalSuppliesModel').modal('hide');
            Swal.fire({
                title: "Thành công!",
                html: "Cập nhật dữ liệu thành công!",
                icon: "success"
            });
            var updateDentalSupply = response.data
            const $row = $(`.dentalSupplies_${updateDentalSupply.suppliesId}`);
            $row.find('td').eq(0).text(updateDentalSupply.suppliesId);
            $row.find('td').eq(1).text(updateDentalSupply.suppliesName);
            $row.find('td').eq(2).text(updateDentalSupply.distributionSupplies.name);
            $row.find('td').eq(3).text(updateDentalSupply.description);

        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            });
            console.log("error", error);
        });
    }
    //dental suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss

    //distribution suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.listDistributionSupplies = () => {
        $http.get(url + '/distribution-supplies').then(response => {
            $scope.listDistributionSuppliesFormDB = response.data

        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
            console.log("error", error);
        })
    }
    //create distribution suppliessssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.createDistributionSupplies = () => {
        $scope.errorDistribution = false
        $scope.errorName = false
        $scope.errorAddress = false
        $scope.errorContactPerson = false
        $scope.errorEmail = false
        $scope.errorTaxCode = false
        if ($scope.distribution == "" || $scope.distribution == undefined) {
            $scope.errorDistribution = true
        } else {
            $scope.errorDistribution = false
        }

        if ($scope.name == "" || $scope.name == undefined) {
            $scope.errorName = true
        } else {
            $scope.errorName = false
        }
        if ($scope.address == "" || $scope.address == undefined) {
            $scope.errorAddress = true
        } else {
            $scope.errorAddress = false
        }

        if ($scope.contactPerson == "" || $scope.contactPerson == undefined) {
            $scope.errorContactPerson = true
        } else {
            $scope.errorContactPerson = false
        }

        if ($scope.email == "" || $scope.email == undefined) {
            $scope.errorEmail = true
        } else {
            $scope.errorEmail = false
        }

        if ($scope.taxCode == "" || $scope.taxCode == undefined) {
            $scope.errorTaxCode = true
        } else {
            $scope.errorTaxCode = false
        }
        if ($scope.errorDistribution ||
            $scope.errorName ||
            $scope.errorAddress ||
            $scope.errorContactPerson ||
            $scope.errorEmail ||
            $scope.errorTaxCode) {
            console.log($scope.errorDistribution,
                $scope.errorName,
                $scope.errorAddress,
                $scope.errorContactPerson,
                $scope.errorEmail,
                $scope.errorTaxCode); return;
        }

        var DistributionSuppliesRequest = {
            distribution: $scope.distribution,

            name: $scope.name,

            address: $scope.address,

            contactPerson: $scope.contactPerson,

            email: $scope.email,

            note: $scope.note,

            taxCode: $scope.taxCode
        }
        $http.post(url + '/distribution-supplies', DistributionSuppliesRequest).then(response => {
           
            Swal.fire({
                title: "Thành công!",
                html: "Đã thêm nhà phân phối thành công!",
                icon: "success"
            })
            $scope.listDistributionSupplies();
        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
            console.log("error", error);
        })
    }

    //distribution suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss


    $scope.listDentalSuppliesFromDB();
    $scope.listDistributionSupplies();
})