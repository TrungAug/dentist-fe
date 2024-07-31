console.log("This is admin list distribution supply");


app.controller('AdminListDistributionSupplies', function ($scope, $http, $rootScope, $location, $timeout,API) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    //code here
    $scope.listDistributionSuppliesFormDB = [];
    //code here
    //jquery

    $scope.clearFormDistributionSupplies = () => {
        $scope.distribution = ''
        $scope.name = ''
        $scope.address = ''
        $scope.contactPerson = ''
        $scope.email = ''
        $scope.note = ''
        $scope.taxCode = ''
    }
    //distribution suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.listDistributionSupplies = () => {
        $http.get(url + '/distribution-supplies-except-deleted').then(response => {
            $scope.listDistributionSuppliesFormDB = response.data
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
            console.log("Response: ", response.data);
            Swal.fire({
                title: "Thành công!",
                html: "Đã thêm nhà phân phối thành công!",
                icon: "success"
            })
            $scope.clearFormDistributionSupplies();
        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
            console.log("error", error);
        })
    }

    //delete distribution suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.deleteDistribution = (d) => {
        Swal.fire({
            title: "Bạn có chắc?",
            text: "Bạn có muốn xóa " + d.name + " này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete(url + '/soft-delete-distribution-supplies/' + d.distributionId).then(response => {
                    console.log("Response delete: ", response.data);
                    Swal.fire({
                        title: "Thành công!",
                        html: "Đã thêm nhà phân phối thành công!",
                        icon: "success"
                    })
                    $('.distribution_' + d.distributionId).remove();
                }).catch(error => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Xảy ra lỗi!</p>',
                        icon: "error"
                    })
                    console.log("error", error);
                })
            }
        });

    }

    //edit distribution suppliesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    $scope.editDistributionSupplies = [];
    $scope.editDistribution = (d) => {

        $http.get(url + '/distribution-supplies-id/' + d.distributionId).then(response => {
            console.log("$scope.listDentalSuppliesFromDB", response.data);
            $scope.editDistributionSupplies = response.data
        }).catch(error => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            });
            console.log("error", error);
        });
    }
    //update distribution supplyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    $scope.updateDistribution = (d) => {

        var DistributionSuppliesRequest = {
            distribution: $scope.editDistributionSupplies.distribution,

            name: $scope.editDistributionSupplies.name,

            address: $scope.editDistributionSupplies.address,

            contactPerson: $scope.editDistributionSupplies.contactPerson,

            email: $scope.editDistributionSupplies.email,

            note: $scope.editDistributionSupplies.note,

            taxCode: $scope.editDistributionSupplies.taxCode
        }
        $http.put(url + '/distribution-supplies/' + $scope.editDistributionSupplies.distributionId, DistributionSuppliesRequest).then(response => {
            console.log("Response: ", response.data);
            var updatedDistribution = response.data
            Swal.fire({
                title: "Thành công!",
                html: "Đã cập nhật nhà phân phối thành công!",
                icon: "success"
            })
            const $row = $(`.distribution_${updatedDistribution.distributionId}`);
            $row.find('td').eq(0).text(updatedDistribution.distributionId);
            $row.find('td').eq(1).text(updatedDistribution.distribution);
            $row.find('td').eq(2).text(updatedDistribution.name);
            $row.find('td').eq(3).text(updatedDistribution.address);
            $row.find('td').eq(4).text(updatedDistribution.email);
            $row.find('td').eq(5).text(updatedDistribution.contactPerson);
            $row.find('td').eq(6).text(updatedDistribution.taxCode);
            $row.find('td').eq(7).text(updatedDistribution.note);
            //clear
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


    $scope.listDistributionSupplies();
})