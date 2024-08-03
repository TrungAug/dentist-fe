app.controller('AdminPatientController', function ($scope, $http, $rootScope, $location, $timeout,API,adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()

    $scope.medicalHistoriesSelections = [] ;

    $('#managePatientsModalMedicalHistory').on('change', function () {
        $timeout(function () {
            let index = $scope.medicalHistoriesSelections.indexOf($('#managePatientsModalMedicalHistory').val())
            if (index === -1) {
                $scope.medicalHistoriesSelections.push($('#managePatientsModalMedicalHistory').val());
                console.log($scope.medicalHistoriesSelections);
            }
        });
    });

    $scope.showHistorySelected = (index) => {

        if (typeof index === 'string') {
            index = $scope.partToId(index) ;
        }
        return $scope.listMedicalHistoryDB[index].name;
    }

    $scope.partToId = (index) => {
        if (typeof index === 'string' && index.includes(':')) {
            index = parseInt(index.split(':')[1]);
            return index ;
        }
    }

    $scope.createMedicalHistoryDetails = (patientId ,medicalHistoryDetailId) => {
        $scope.formMedicalHistoryDetail = {
            medicalHistoryDetailId: -1,
            patientId: patientId,
            medicalHistoryId: medicalHistoryDetailId,
        } ; 
        var requestMedicalHistoryDetailJSON = angular.toJson($scope.formMedicalHistoryDetail)
        console.log("requestMedicalHistoryDetailJSON", requestMedicalHistoryDetailJSON);
        $http.post(url + '/medical-history-detail', requestMedicalHistoryDetailJSON).then(response => {
            Swal.fire({
                
            })
            
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        });

    }
    $scope.listMedicalHistoriesDetailDB = [] ;

    // Lấy danh sách MedicalHistories
    $scope.getListMedicalHistoriesDetail = () => {
        $http.get(url + "/medical-history-detail-except-deleted").then(response => {
            $scope.listMedicalHistoriesDetailDB = response.data
            console.log("$scope.listMedicalHistoriesDetailDB", $scope.listMedicalHistoriesDetailDB);
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    };

    // Lấy danh sách MedicalHistories theo PatientID
    $scope.showMedicalHistories = (patientId) => {
        console.log("in") ;
        return $scope.listMedicalHistoriesDetailDB
        .filter(function(item) {
            console.log("item : ", item);
            console.log("patientId : ", item.patient.patientId) ;
            return item.patient.patientId === patientId;
        })
        .map(function(item) {
            console.log("medicalID : ", item.medicalHistory.medicalHistoryId)
            return item.medicalHistory.medicalHistoryId;
        });
    };


    $scope.listGenderTypeDB = [
        { genderId: 'MALE', genderName: 'Nam' },
        { genderId: 'FEMALE', genderName: 'Nữ' },
        { genderId: 'UNISEX', genderName: 'Khác' }
    ];

    $scope.getMedicalHistories = function () {
        $http.get(url+'/medical-history').then(function (response) {
            $scope.listMedicalHistoryDB = response.data;
        }, function (error) {
            console.error('Error fetching medical histories:', error);
        });

    };

    $scope.getGenderText = function (gender) {
        switch (gender) {
            case 'MALE':
                return 'Nam';
            case 'FEMALE':
                return 'Nữ';
            case 'OTHER':
                return 'Khác';
            default:
                return '';
        }
    };

    $scope.formatDate = function (date) {
        var d = new Date(date);
        if (isNaN(d.getTime())) return '';
        var day = ('0' + d.getDate()).slice(-2);
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    $scope.getListPatient = () => {
        $http.get(url + '/patient-except-deleted').then(respone => {
            $scope.listPatientDB = respone.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-patient')) {
                $('#dataTable-list-patient').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-patient').DataTable({
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
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.crudPatient = () => {
        var currentDate = new Date();
        $scope.formPatient = {
            patientId: -1,
            fullName: '',
            Type: '',
            CitizenIdentificationNumber: '',
            phoneNumber: '',
            gender: '',
            birthday: new Date("01/01/1999"),
            imageURL: 'abc.jpg',
            deleted: false
        };

        $scope.formMedicalHistoryDetail = {
            medicalHistoryDetailId: -1,
            patientId: '',
            medicalHistoryId: '',
        } ; 

        $scope.medicalHistoriesSelections = []
    
        $scope.validationForm = () => {
            var valid = false;
            $scope.processSelect2Data = () => {
                if (typeof $scope.formPatient.gender === 'string' && $scope.formPatient.gender.includes(':')) {
                    $scope.formPatient.gender = $scope.formPatient.gender.split(':')[1];
                }
            };
    
            if ($scope.formPatient.fullName == "" || $scope.formPatient.fullName == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập họ tên!",
                    icon: "error"
                });
            } else if ($scope.formPatient.phoneNumber == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số điện thoại!",
                    icon: "error"
                });
            } else if ($scope.formPatient.gender == "" || $scope.formPatient.gender == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn giới tính!",
                    icon: "error"
                });
            } else if ($scope.formPatient.citizenIdentificationNumber == "" || $scope.formPatient.citizenIdentificationNumber == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số CMND/CCCD!",
                    icon: "error"
                });
            } else {
                $scope.processSelect2Data();
                valid = true;
            }
            return valid;
        };

        $scope.editPatient = (patient, $event) => {
            console.log("patient", patient);
            $event.preventDefault()
            if (patient != null) {
                $scope.formPatient = {
                    patientId: patient.patientId,
                    fullName: patient.fullName,
                    citizenIdentificationNumber: patient.citizenIdentificationNumber,
                    phoneNumber: patient.phoneNumber,
                    gender: patient.gender,
                    imageURL: patient.imageURL,
                    birthday: new Date(patient.birthday),
                    deleted: false
                }
            }
            
            $scope.medicalHistoriesSelections = $scope.showMedicalHistories(patient.patientId)
            console.log(patient.patientId) ;
            console.log($scope.medicalHistoriesSelections) ;
            const firstTabButtonCreate = document.getElementById('form-tab-patient');
            firstTabButtonCreate.click();
            var element = document.getElementById('managePatientsModalMedicalHistory');
            element.disabled = true ;
        }
        
        $scope.createPatient = () => {
            if ($scope.formPatient.patientId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                var requestPatientJSON = angular.toJson($scope.formPatient)
                console.log("requestPatientJSON", requestPatientJSON);
                $http.post(url + '/patient', requestPatientJSON).then(response => {
                    var idpatient = response.data.patientId ;
                    $scope.medicalHistoriesSelections.forEach(element => {
                        element = $scope.partToId(element) 
                        $scope.createMedicalHistoryDetails(idpatient, element);
                    });
                    Swal.fire({
                        title: "Thành công!",
                        html: "Đã thêm bệnh nhân thành công!",
                        icon: "success"
                    })
                    $scope.resetForm()
                    $scope.getListPatient()
                    const secondTabButtonCreate = document.getElementById('list-tab-patient');
                    secondTabButtonCreate.click();
                }).catch(err => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Xảy ra lỗi!</p>',
                        icon: "error"
                    })
                });
            }
        }
        $scope.updatePatient = () => {
            if ($scope.formPatient.patientId == -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                var requestPatientJSON = angular.toJson($scope.formPatient)
                var patientId = $scope.formPatient.patientId
                console.log(requestPatientJSON)
                $http.put(url + '/patient/' + patientId, requestPatientJSON).then(response => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Cập nhật thành công!",
                        icon: "success"
                    })
                    $scope.resetForm()
                    $scope.getListPatient()
                    const secondTabButtonCreate = document.getElementById('list-tab-patient');
                    secondTabButtonCreate.click();
                }).catch(err => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Cập nhật thất bại!</p>',
                        icon: "error"
                    })
                })
            }
        }
        
        $scope.deletePatient = (patient, $event) => {
            $event.preventDefault()
            console.log("delete patient", patient)
            var patientId = patient.patientId
            Swal.fire({
                text: "Bạn có muốn xóa Bệnh nhân " + patient.fullName + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-patient/' + patientId).then(response => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        })
                        $scope.getListPatient()
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

        $scope.resetForm = () => {
            $scope.formPatient = {
                patientId: -1,
                fullName: '',
                citizenIdentificationNumber: '',
                phoneNumber: '',
                gender: '',
                imageURL: 'abc.jpg',
                birthday: new Date("01/01/1999"),
                deleted: false
            }
            $scope.medicalHistoriesSelections = []

            $scope.formMedicalHistoryDetail = {
                medicalHistoryDetailId: -1,
                patientId: '',
                medicalHistoryId: '',
            } ; 
            var element = document.getElementById('managePatientsModalMedicalHistory');
            element.disabled = false ;
        }
        
    }
    $scope.getMedicalHistories();
    $scope.createPatient = () => {
        console.log($scope.formPatient);
    }
    $scope.getListMedicalHistoriesDetail() ;
    $scope.crudPatient();
    $scope.getListPatient()
})


