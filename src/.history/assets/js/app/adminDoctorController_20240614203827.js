app.controller('AdminDoctorController', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.listDegreesTypeDB = [
        { degreesId: 1, degreesName: 'Thạc sĩ' },
        { degreesId: 2, degreesName: 'Tiến sĩ' },
        { degreesId: 3, degreesName: 'Bác sĩ' },
        { degreesId: 4, degreesName: 'Giáo sư' },
        { degreesId: 5, degreesName: 'Y tá' },
        { degreesId: 6, degreesName: 'Y sĩ' },
        // Các chuyên khoa khác trong nha khoa
    ];

    $scope.listSpecialtyTypeDB = [
        { specialtyId: 1, specialtyName: 'Răng hàm mặt' },
        { specialtyId: 2, specialtyName: 'Nha sĩ tổng quát' },
        { specialtyId: 3, specialtyName: 'Nha sĩ trẻ em' },
        { specialtyId: 4, specialtyName: 'Trồng răng' },
        { specialtyId: 5, specialtyName: 'Chỉnh nha' },
        // Thêm các chuyên khoa khác tương tự nếu cần
    ];

    $scope.listGenderTypeDB = [
        { genderId: 'MALE', genderName: 'Nam' },
        { genderId: 'FEMALE', genderName: 'Nữ' },
        { genderId: 'UNISEX', genderName: 'Khác' }
    ];
    $scope.getListDegrees=()=>{
        $http.get(url+"/specialty").then(response =>{

        }).catch(err =>{
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    }
    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
            // console.log("listDoctorDB",respone.data);
            if ($.fn.DataTable.isDataTable('#dataTable-list-doctor')) {
                $('#dataTable-list-doctor').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-doctor').DataTable({
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
    $scope.crudDoctor = () => {
        var currentDate = new Date();
        $scope.formDoctor = {
            image: 'abc.jpg',
            doctorId: -1,
            fullName: '',
            degrees: '',
            specialtyId: '',
            phoneNumber: '',
            gender: '',
            address: '',
            birthday: new Date(),
            signature: 'abc',
            deleted:false
        }
        $scope.checkAge = function (dateOfBirth) {
            if (!dateOfBirth) return false;

            var birthDate = new Date(dateOfBirth);
            var age = currentDate.getFullYear() - birthDate.getFullYear();
            if (currentDate.getMonth() < birthDate.getMonth() ||
                (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 18;
        };

        $scope.validateBirthday = function () {
            return $scope.checkAge($scope.formDoctor.birthday);
        };

        $scope.$watch('formDoctor.birthday', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.validateBirthday();
            }
        });

        $scope.validationForm = () => {
            if ($scope.formDoctor.degrees == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn bằng cấp!",
                    icon: "error"
                })
                return
            }
            if ($scope.formDoctor.specialtyId == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn chuyên khoa!",
                    icon: "error"
                })
                return
            }
            if ($scope.formDoctor.gender == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn giới tính!",
                    icon: "error"
                })
                return
            }
            if ($scope.formDoctor.fullName == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập họ tên!",
                    icon: "error"
                })
                return
            }
            if (!$scope.validateBirthday()) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Ngày sinh phải đủ 18 tuổi!",
                    icon: "error"
                })
                return
            }
            if ($scope.formDoctor.phoneNumber == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số điện thoại!",
                    icon: "error"
                })
                return
            }
            if ($scope.formDoctor.address == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập địa chỉ!",
                    icon: "error"
                })
                return
            }
        }

        $scope.editDoctor = (doctor,$event) => {
            console.log("doctor",doctor);
            $event.preventDefault()          
            if (doctor != null) {
               $scope.formDoctor = {
                image: doctor.image,
                doctorId: doctor.doctorId,
                fullName: doctor.fullName,
                degrees: doctor.degrees,
                //specialtyId: doctor.specialty,
                phoneNumber: doctor.phoneNumber,
                gender: doctor.gender,
                address: doctor.address,
                birthday: new Date(doctor.birthday),
                signature: doctor.signature,
                deleted:doctor.deleted
            }
               $scope.formDoctor.specialtyId = doctor.specialty ? doctor.specialty.specialtyId : -1
               
            }
            
            const firstTabButtonCreate = document.getElementById('form-tab');
            firstTabButtonCreate.click();          
        }

        $scope.createDoctor = () => {
            $scope.validationForm()
            if ($scope.formDoctor.doctorId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var requsetDoctorJSON = angular.toJson($scope.formDoctor)
            console.log("requsetDoctorJSON", requsetDoctorJSON);
            $http.post(url + '/doctor', requsetDoctorJSON).then(respone => {
                Swal.fire({
                    title: "Thành công!",
                    html: "Đã thêm bác sĩ thành công!",
                    icon: "success"
                })
                $scope.resetForm()
                $scope.getListDoctor()
                const secondTabButtonCreate = document.getElementById('list-tab');
                secondTabButtonCreate.click();
            }).catch(err => {
                Swal.fire({
                    title: "Thất bại!",
                    html: '<p class="text-danger">Xảy ra lỗi!</p>',
                    icon: "error"
                })
            });
        }

        $scope.updateDoctor = () => {
            $scope.validationForm()
            if ($scope.formDoctor.doctorId == -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var requsetDoctorJSON = angular.toJson($scope.formDoctor)
            var doctorId = $scope.formDoctor.doctorId
            console.log("requsetDoctorJSON", requsetDoctorJSON);
            $http.put(url+'/doctor/'+doctorId,requsetDoctorJSON).then(respone =>{
                Swal.fire({
                    title: "Thành công!",
                    html: "Cập nhật thành công!",
                    icon: "success"
                })
                $scope.resetForm()
                $scope.getListDoctor()
                const secondTabButtonCreate = document.getElementById('list-tab');
                secondTabButtonCreate.click();
            }).catch(err=>{              
                Swal.fire({
                    title: "Thất bại!",
                    html: '<p class="text-danger">Cập nhật thất bại!</p>',
                    icon: "error"
                })
            })
        }
       
        $scope.deleteDoctor = (doctor, $event) => {
            $event.preventDefault()
            console.log("delete doctor", doctor)
            var doctorId = doctor.doctorId
            Swal.fire({
                text: "Bạn có muốn xóa Bác sĩ "+doctor.fullName+" ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/sort-delete-doctor/' + doctorId).then(respone => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        })
                        $scope.getListDoctor()
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
            $scope.formDoctor = {
                image: 'abc.jpg',
                doctorId: -1,
                fullName: '',
                degrees: '',
                specialtyId: '',
                phoneNumber: '',
                gender: '',
                address: '',
                birthday: new Date(),
                signature: 'abc'
            }
            Swal.fire({
                title: "Thành công!",
                html: "Làm mới thành công!",
                icon: "success"
            })
        }
    }


    // $timeout(function() {
    //     $('#dataTable-list-doctor').DataTable({
    //         autoWidth: true,
    //         "lengthMenu": [
    //             [16, 32, 64, -1],
    //             [16, 32, 64, "All"]
    //         ],
    //         language: {
    //             sProcessing: "Đang xử lý...",
    //             sLengthMenu: "Hiển thị _MENU_ mục",
    //             sZeroRecords: "Không tìm thấy dòng nào phù hợp",
    //             sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
    //             sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
    //             sInfoFiltered: "(được lọc từ _MAX_ mục)",
    //             sInfoPostFix: "",
    //             sSearch: "Tìm kiếm:",
    //             sUrl: "",
    //             oPaginate: {
    //                 sFirst: "Đầu",
    //                 sPrevious: "Trước",
    //                 sNext: "Tiếp",
    //                 sLast: "Cuối"
    //             }
    //         }
    //     });
    // }, 0);
    $scope.getListDoctor()
    $scope.crudDoctor()
})