app.controller('AdminMedicineController', function ($scope, $http, $rootScope, $location, $timeout,API) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.getListMedicine = () => {
        $http.get(url + '/medicines', { headers: headers }).then(response => {
            $scope.listMedicineDB = response.data;
            if ($.fn.DataTable.isDataTable('#dataTable-list-medicine')) {
                $('#dataTable-list-medicine').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-medicine').DataTable({
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
                        sSearch: "Tìm kiếm:",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    };

    $scope.getListMedicineCategory = function () {
        $http.get(url + '/medicine-categories', { headers: headers }).then(response => {
            $scope.listMedicineCategoryDB = response.data;
        });
    };

    $scope.getListMedicinesDosageUnit = function () {
        $http.get(url + '/medicines-dosage-units', { headers: headers }).then(response => {
            $scope.listMedicinesDosageUnitDB = response.data;
        });
    };

    $scope.getListMedicineDistribution = function () {
        $http.get(url + '/distribution-medicines', { headers: headers }).then(response => {
            $scope.listDistributionMedicinesDB = response.data;
        });
    };

    $scope.getListMedicineDosageAmount = function () {
        $http.get(url + '/medicines-dosage-amounts', { headers: headers }).then(response => {
            $scope.listMedicinesDosageAmountDB = response.data;
        });
    };

    $scope.crudMedicine = () => {
        $scope.formMedicine = {
            medicinesId: -1,
            medicineName: '',
            medicineCategoryId: -1,
            distributionMedicinesId: -1,
            medicinesDosageAmountId: -1,
            medicinesDosageUnitId: -1,
            beforeEating: false
        };

        $scope.validationForm = () => {
            if (!$scope.formMedicine.medicineName) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập tên thuốc!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.medicineCategoryId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn loại thuốc!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.distributionMedicinesId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn nhà phân phối!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.medicinesDosageAmountId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn liều lượng!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.medicinesDosageUnitId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn đơn vị liều lượng!",
                    icon: "error"
                });
                return false;
            }
            return true;
        };

        $scope.createMedicine = () => {
            if ($scope.formMedicine.medicinesId !== -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                });
                return;
            }
            if ($scope.validationForm()) {
                var requestMedicineJSON = angular.toJson($scope.formMedicine);
                console.log("requestMedicineJSON", requestMedicineJSON);
                $http.post(url + '/medicines', requestMedicineJSON, { headers: headers }).then(response => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Đã thêm thuốc thành công!",
                        icon: "success"
                    });
                    $scope.resetForm();
                    $scope.getListMedicine();
                    document.getElementById('list-tab-medicine').click();
                }).catch(err => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Xảy ra lỗi!</p>',
                        icon: "error"
                    });
                });
            }
        };

        $scope.updateMedicine = () => {
            if ($scope.formMedicine.medicinesId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                });
                return;
            }
            if ($scope.validationForm()) {
                var requestMedicineJSON = angular.toJson($scope.formMedicine);
                var medicinesId = $scope.formMedicine.medicinesId;
                console.log(requestMedicineJSON);
                $http.put(url + '/medicines/' + medicinesId, requestMedicineJSON, { headers: headers }).then(response => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Cập nhật thành công!",
                        icon: "success"
                    });
                    $scope.resetForm();
                    $scope.getListMedicine();
                    document.getElementById('list-tab-medicine').click();
                }).catch(err => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Cập nhật thất bại!</p>',
                        icon: "error"
                    });
                });
            }
        };

        $scope.deleteMedicine = (medicine, $event) => {
            $event.preventDefault();
            console.log("delete medicine", medicine);
            var medicinesId = medicine.medicinesId;
            Swal.fire({
                text: "Bạn có muốn xóa Thuốc " + medicine.medicineName + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/medicines/' + medicinesId, { headers: headers }).then(response => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        });
                        $scope.getListMedicine();
                    }).catch(err => {
                        Swal.fire({
                            title: "Thất bại!",
                            html: '<p class="text-danger">Xảy ra lỗi!</p>',
                            icon: "error"
                        });
                    });
                }
            });
        };

        $scope.resetForm = () => {
            $scope.formMedicine = {
                medicinesId: -1,
                medicineName: '',
                medicineCategoryId: -1,
                distributionMedicinesId: -1,
                medicinesDosageAmountId: -1,
                medicinesDosageUnitId: -1,
                beforeEating: false
            };
        };

        $scope.editMedicine = (medicine, $event) => {
            $event.preventDefault();
            console.log("medicine", medicine);
            if (medicine != null) {
                $scope.formMedicine = {
                    medicinesId: medicine.medicinesId,
                    medicineName: medicine.medicineName,
                    medicineCategoryId: medicine.medicineCategory.medicineCategoryId,
                    distributionMedicinesId: medicine.distributionMedicines.distributionMedicinesId,
                    medicinesDosageAmountId: medicine.medicinesDosageAmount.medicinesDosageAmountId,
                    medicinesDosageUnitId: medicine.medicinesDosageUnit.medicinesDosageUnitId,
                    beforeEating: medicine.beforeEating,
                    deleted: medicine.deleted
                };
            }
            document.getElementById('form-tab-medicine').click();
        };
    };

    $scope.crudMedicine();
    $scope.getListMedicinesDosageUnit();
    $scope.getListMedicineDosageAmount();
    $scope.getListMedicineDistribution();
    $scope.getListMedicine();
    $scope.getListMedicineCategory();
});
