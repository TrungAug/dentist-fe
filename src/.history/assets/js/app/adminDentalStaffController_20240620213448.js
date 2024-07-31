app.controller('AdminDentalStaffController', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.getListDepartments = () => {
        $http.get(url + '/department').then(response => {
            $scope.listDepartmentDB = response.data
            console.log(" $scope.listDepartmentDB", $scope.listDepartmentDB);
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.listGenderTypeDB = [
        { genderId: 'MALE', genderName: 'Nam' },
        { genderId: 'FEMALE', genderName: 'Nữ' },
        { genderId: 'UNISEX', genderName: 'Khác' }
    ]; //backend xài enum

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
            });
        $('.select2-multi').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });
        $('.drgpicker').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                locale:
                {
                    format: 'DD/MM/YYYY'
                }
            });
        $('.time-input').timepicker(
            {
                'scrollDefault': 'now',
                'zindex': '9999' /* fix modal open */
            });
        /** date range picker */
        if ($('.datetimes').length) {
            $('.datetimes').daterangepicker(
                {
                    timePicker: true,
                    startDate: moment().startOf('hour'),
                    endDate: moment().startOf('hour').add(32, 'hour'),
                    locale:
                    {
                        format: 'M/DD hh:mm A'
                    }
                });
        }
        var start = moment().subtract(29, 'days');
        var end = moment();

        function cb(start, end) {
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        $('#reportrange').daterangepicker(
            {
                startDate: start,
                endDate: end,
                ranges:
                {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);
        cb(start, end);
        $('.input-placeholder').mask("00/00/0000",
            {
                placeholder: "__/__/____"
            });
        $('.input-zip').mask('00000-000',
            {
                placeholder: "____-___"
            });
        $('.input-money').mask("#.##0,00",
            {
                reverse: true
            });
        $('.input-phoneus').mask('(000) 000-0000');
        $('.input-mixed').mask('AAA 000-S0S');
        $('.input-ip').mask('0ZZ.0ZZ.0ZZ.0ZZ',
            {
                translation:
                {
                    'Z':
                    {
                        pattern: /[0-9]/,
                        optional: true
                    }
                },
                placeholder: "___.___.___.___"
            });
        // editor
        var editor = document.getElementById('editor');
        if (editor) {
            var toolbarOptions = [
                [
                    {
                        'font': []
                    }],
                [
                    {
                        'header': [1, 2, 3, 4, 5, 6, false]
                    }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [
                    {
                        'header': 1
                    },
                    {
                        'header': 2
                    }],
                [
                    {
                        'list': 'ordered'
                    },
                    {
                        'list': 'bullet'
                    }],
                [
                    {
                        'script': 'sub'
                    },
                    {
                        'script': 'super'
                    }],
                [
                    {
                        'indent': '-1'
                    },
                    {
                        'indent': '+1'
                    }], // outdent/indent
                [
                    {
                        'direction': 'rtl'
                    }], // text direction
                [
                    {
                        'color': []
                    },
                    {
                        'background': []
                    }], // dropdown with defaults from theme
                [
                    {
                        'align': []
                    }],
                ['clean'] // remove formatting button
            ];
            var quill = new Quill(editor,
                {
                    modules:
                    {
                        toolbar: toolbarOptions
                    },
                    theme: 'snow'
                });
        }
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (function () {
            'use strict';
            window.addEventListener('load', function () {
                // Fetch all the forms we want to apply custom Bootstrap validation styles to
                var forms = document.getElementsByClassName('needs-validation');
                // Loop over them and prevent submission
                var validation = Array.prototype.filter.call(forms, function (form) {
                    form.addEventListener('submit', function (event) {
                        if (form.checkValidity() === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            }, false);
        })();

        $('#departmentId').on('change', function () {
            $timeout(function () {
                $scope.formDentalStaff.departmentId = $('#departmentId').val();
            });
        });
        $('#dentalStaffGender').on('change', function () {
            $timeout(function () {
                $scope.formDentalStaff.gender = $('#dentalStaffGender').val();
            });
        });
    }

    $scope.getListdentalStaff = () => {
        $http.get(url + '/dental-staff').then(respone => {
            $scope.listdentalStaffDB = respone.data
            console.log("listdentalStaffDB", respone.data);
            if ($.fn.DataTable.isDataTable('#dataTable-list-dentalStaff')) {
                $('#dataTable-list-dentalStaff').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-dentalStaff').DataTable({
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
    $scope.crudDentalStaff = () => {
        var currentDate = new Date();
        // $scope.formDentalStaff = {
        //     image: 'abc.jpg',
        //     dentalStaffId: -1,
        //     fullName: '',
        //     departmentId: '',
        //     phoneNumber: '',
        //     gender: '',
        //     address: '',
        //     birthday: new Date("01/01/1999"),
        //     deleted: false
        // }
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
            return $scope.checkAge($scope.formDentalStaff.birthday);
        };

        $scope.$watch('formDentalStaff.birthday', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.validateBirthday();
            }
        });

        $scope.validationForm = () => {
            var valid = false
            $scope.processSelect2Data = () => {
                if (typeof $scope.formDentalStaff.departmentId === 'string' && $scope.formDentalStaff.departmentId.includes(':')) {
                    $scope.formDentalStaff.departmentId = parseInt($scope.formDentalStaff.departmentId.split(':')[1]);
                }

                if (typeof $scope.formDentalStaff.gender === 'string' && $scope.formDentalStaff.gender.includes(':')) {
                    $scope.formDentalStaff.gender = $scope.formDentalStaff.gender.split(':')[1];
                }
            }
            if ($scope.formDentalStaff.departmentId == "" || $scope.formDentalStaff.departmentId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn phòng ban!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.gender == "" || $scope.formDentalStaff.gender == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn giới tính!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.fullName == "" || $scope.formDentalStaff.fullName == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập họ tên!",
                    icon: "error"
                })
            } else if (!$scope.validateBirthday()) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Ngày sinh phải đủ 18 tuổi!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.phoneNumber == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số điện thoại!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.address == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập địa chỉ!",
                    icon: "error"
                })
            } else {
                $scope.processSelect2Data()
                valid = true
            }
            return valid
        }

        $scope.editDentalStaff = (dentalStaff, $event) => {
            console.log("dentalStaff", dentalStaff);
            $event.preventDefault()
            if (dentalStaff != null) {
                $scope.formDentalStaff = {
                    image: dentalStaff.imageURL,
                    dentalStaffId: dentalStaff.dentalStaffId,
                    fullName: dentalStaff.fullname,
                    phoneNumber: dentalStaff.phoneNumber,
                    gender: dentalStaff.gender,
                    address: dentalStaff.address,
                    birthday: new Date(dentalStaff.birthday),
                    deleted: dentalStaff.isDeleted
                }
            }
            const firstTabButtonCreate = document.getElementById('form-tab-dentalStaff');
            firstTabButtonCreate.click();
        }

        $scope.createdentalStaff = () => {
            if ($scope.formDentalStaff.dentalStaffId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                var requsetdentalStaffJSON = angular.toJson($scope.formDentalStaff)
                console.log("requsetdentalStaffJSON", requsetdentalStaffJSON);
                $http.post(url + '/dental-staff', requsetdentalStaffJSON).then(respone => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Đã thêm nhân viên thành công!",
                        icon: "success"
                    })
                    $scope.resetForm()
                    $scope.getListdentalStaff()
                    const secondTabButtonCreate = document.getElementById('list-tab-dentalStaff');
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

        $scope.updatedentalStaff = () => {
            if ($scope.formDentalStaff.dentalStaffId == -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                var requsetdentalStaffJSON = angular.toJson($scope.formDentalStaff)
                var dentalStaffId = $scope.formDentalStaff.dentalStaffId
                console.log("requsetdentalStaffJSON", requsetdentalStaffJSON);
                $http.put(url + '/dental-staff/' + dentalStaffId, requsetdentalStaffJSON).then(respone => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Cập nhật thành công!",
                        icon: "success"
                    })
                    $scope.resetForm()
                    $scope.getListdentalStaff()
                    const secondTabButtonCreate = document.getElementById('list-tab-dentalStaff');
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

        $scope.deletedentalStaff = (dentalStaff, $event) => {
            $event.preventDefault()
            console.log("delete dentalStaff", dentalStaff)
            var dentalStaffId = dentalStaff.dentalStaffId
            Swal.fire({
                text: "Bạn có muốn xóa Bác sĩ " + dentalStaff.fullname + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/sort-delete-dental-staff/' + dentalStaffId).then(respone => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        })
                        $scope.getListdentalStaff()
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
            $scope.formDentalStaff = {
                image: 'abc.jpg',
                dentalStaffId: -1,
                fullName: '',
                departmentId: '',
                phoneNumber: '',
                gender: '',
                address: '',
                birthday: new Date("01/01/1999"),
                deleted: false
            }
        }
    }

    $scope.getListDepartments()  
    $scope.getListdentalStaff()
    $scope.initializeUIComponents()
    $scope.crudDentalStaff()
    $scope.resetForm() 

    
})