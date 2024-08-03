app.controller('AdminCTResultController', function ($scope, $http, $rootScope, $location, $timeout,API) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    //code here
    $scope.listDentalStaffsDB = [
        // Các nhân viên trong nha khoa
    ];

    $scope.listAppointmentsDB = [
        // Các cuộc hẹn trong nha khoa
    ];

    $scope.listImagingPlanesDB = [
        // Các hướng chụp trong nha khoa
    ];

    $scope.listCTResultsDB = [
        // Các ảnh chụp CT trong nha khoa
    ]

    $scope.listAbnormalitiesDB = [
        // Các dấu hiệu bất thường từ ảnh chụp
    ]

    $scope.listCTResultAbnormalitiesDB = [
        // Các phim chụp và bất thường tương ứng
    ]

    $scope.urlImg = (filename) => {
        return "http://localhost:8080/api/v1/auth/twobee/images/" + filename;
    }



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

        $('#dentalStaffId').on('change', function () {
            $timeout(function () {
                $scope.formCTResult.dentalStaffId = $('#dentalStaffId').val();
                console.log("dental staff id: ", $scope.formCTResult.dentalStaffId);
            });
        });
        $('#appointmentId').on('change', function () {
            $timeout(function () {
                $scope.formCTResult.appointmentId = $('#appointmentId').val();
            });
        });
        $('#imagingPlanesId').on('change', function () {
            $timeout(function () {
                $scope.formCTResult.imagingPlanesId = $('#imagingPlanesId').val();
            });
        });
        $('#abnormalityId').on('change', function () {
            $timeout(function () {
                $scope.formCTResultAbnormality.abnormalityId = $('#abnormalityId').val();
            });
        });
    }
    // Lấy danh sách cuộc hẹn từ DB
    $scope.getListAppointments = () => {
        $http.get(url + "/appointment-except-deleted").then(response => {
            $scope.listAppointmentsDB = response.data
            console.log("$scope.listAppointmentsDB", $scope.listAppointmentsDB);
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    }
    // Lấy danh sách nhân viên từ DB
    $scope.getListDentalStaffs = () => {
        $http.get(url + "/dental-staff-except-deleted").then(response => {
            $scope.listDentalStaffsDB = response.data
            console.log("$scope.listDentalStaffsDB", $scope.listDentalStaffsDB);
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    }
    // Lấy danh sách hướng chụp từ DB
    $scope.getListImagingPlanes = () => {
        $http.get(url + "/imaging-planes-except-deleted").then(response => {
            $scope.listImagingPlanesDB = response.data
            console.log("$scope.listImagingPlanesDB", $scope.listImagingPlanesDB);
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    }
    // Lấy danh sách các dấu hiệu bất thường
    $scope.getListAbnormalities = () => {
        $http.get(url + "/abnormality-except-deleted").then(response => {
            $scope.listAbnormalitiesDB = response.data
            console.log("$scope.listAbnormalitiesDB", $scope.listAbnormalitiesDB);
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    }
    // Lấy danh sách film chụp và vấn để bất thường
    $scope.getListCTResultAbnormalities = () => {
        $http.get(url + "/ct-result-abnormality-except-deleted").then(response => {
            $scope.listCTResultAbnormalitiesDB = response.data
            console.log("$scope.listCTResultAbnormalitiesDB", $scope.listCTResultAbnormalitiesDB);
        }).catch(err => {
            Swal.fire({
                title: "Thất bại!",
                html: '<p class="text-danger">Xảy ra lỗi!</p>',
                icon: "error"
            })
        })
    };

    //
    $scope.showCTResultAbnormality = (appointmentCTResultId) => {
        const result = $scope.listCTResultAbnormalitiesDB.find(item =>
            item.appointmentCTResult.appointmentCTResultId === appointmentCTResultId
        );

        return result;
    };

    // Start Xử lý hình ảnh
    $scope.filenames = []
    $scope.listImg = function () {
        $http.get(url + '/images', { headers: headers }).then(response => {
            $scope.filenames = response.data
            // lưu ảnh
        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.urlImage = (filename) => {
        console.log("this is urlImage")
        return "http://localhost:8081/api/v1/auth/uploadImage/" + filename;
    }

    $scope.uploadImg = (files) => {

        if (files == null) {
            alert("Upload hình chưa thành công")
            return
        }
        var form = new FormData();
        for (var i = 0; i < files.length; i++) {
            form.append("files", files[i]);
        }

        $http.post(url + "/saveImage/uploads", form, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                ...headers
            }
        }).then(response => {
            var uploadedFilenames = response.data;

            // Lưu imageURL
            $scope.formCTResult.image = uploadedFilenames[0] ;
            
            // Lưu các tên file vào mảng $scope.filenames
            $scope.filenames.push(...uploadedFilenames);

            // Hiển thị hình ảnh từ các tên file này trên giao diện người dùng
            $scope.images = $scope.filenames.map(filename => {
                return {
                    url: 'assets/images/' + filename,
                    alt: 'Hình ảnh ' + filename
                };
            });
        }).catch(err => {
            console.log("error: ", err);
        })
    }

    $scope.deleteImg = (filename) => {
        $http.delete(url + "/deleteImage/images/" + filename, { headers: headers }).then(resp => {
            let i = $scope.filenames.findIndex(name => name == filename);
            $scope.filenames.splice(i, 1);
        }).catch(err => {
            console.log("error", err);
        })
    }

    // End Xử lý hình ảnh

    // Lấy danh sách ảnh chụp CT từ DB
    $scope.getListCTResults = () => {
        $http.get(url + '/appointment-ct-result-except-deleted').then(respone => {
            $scope.listCTResultsDB = respone.data
            // console.log("listDoctorDB",respone.data);
            if ($.fn.DataTable.isDataTable('#dataTable-list-ct-result')) {
                $('#dataTable-list-ct-result').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-ct-result').DataTable({
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
    $scope.crudCTResult = () => {
        var currentDate = new Date();
        $scope.formCTResult = {
            appointmentCTResultId: -1,
            image: '',
            dentalStaffId: '',
            AppointmentId: '',
            imagingPlanesId: '',
            date: new Date("01/01/2024"),
        }
        $scope.formCTResultAbnormality = {
            ctresultAbnormalityId: -1,
            abnormalityId: '',
            appointmentCTResult: '',
            description: '',
        }
        $scope.checkDate = function (dateTakeCT) {
            if (!dateTakeCT) return false;

            var dateTackPic = new Date(dateTakeCT);

            return dateTackPic <= currentDate;
        };

        $scope.validateDate = function () {
            return $scope.checkDate($scope.formCTResult.date);
        };

        // $scope.$watch('formDoctor.birthday', function (newVal, oldVal) {
        //     if (newVal !== oldVal) {
        //         $scope.validateBirthday();
        //     }
        // });

        $scope.validationForm = () => {
            var valid = false
            $scope.processSelect2Data = () => {
                if (typeof $scope.formCTResult.dentalStaffId === 'string' && $scope.formCTResult.dentalStaffId.includes(':')) {
                    $scope.formCTResult.dentalStaffId = parseInt($scope.formCTResult.dentalStaffId.split(':')[1]);
                }

                if (typeof $scope.formCTResult.appointmentId === 'string' && $scope.formCTResult.appointmentId.includes(':')) {
                    $scope.formCTResult.appointmentId = parseInt($scope.formCTResult.appointmentId.split(':')[1]);
                }

                if (typeof $scope.formCTResult.imagingPlanesId === 'string' && $scope.formCTResult.imagingPlanesId.includes(':')) {
                    $scope.formCTResult.imagingPlanesId = $scope.formCTResult.imagingPlanesId.split(':')[1];
                }

                if (typeof $scope.formCTResultAbnormality.abnormalityId === 'string' && $scope.formCTResultAbnormality.abnormalityId.includes(':')) {
                    $scope.formCTResultAbnormality.abnormalityId = $scope.formCTResultAbnormality.abnormalityId.split(':')[1];
                }
            }
            if (!$scope.validateDate()) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Ngày chụp phải nhỏ hơn hoặc bẳng ngày hiện tại!",
                    icon: "error"
                })
            }
            else if ($scope.formCTResult.dentalStaffId == "" || $scope.formCTResult.dentalStaffId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn nhân viên!",
                    icon: "error"
                })
            }
            // else if ($scope.formCTResult.appointmentId == "" || $scope.formCTResult.appointmentId == null) {
            //     Swal.fire({
            //         title: "Cảnh báo!",
            //         html: "Vui lòng chọn bệnh nhân!",
            //         icon: "error"
            //     })
            // }
            else if ($scope.formCTResult.imagingPlanesId == "" || $scope.formCTResult.imagingPlanesId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn hướng chụp!",
                    icon: "error"
                })
            }
            else if ($scope.formCTResultAbnormality.abnormalityId == "" || $scope.formCTResultAbnormality.abnormalityId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn vấn đề bất thường!",
                    icon: "error"
                })
            }
            else {
                $scope.processSelect2Data()
                valid = true
            }
            return valid
        }

        $scope.editCTResult = (cs, $event) => {
            console.log("cs", cs);
            $event.preventDefault()
            if (cs != null) {
                $scope.formCTResult = {
                    appointmentCTResultId: cs.appointmentCTResultId,
                    image: cs.imageURL,
                    dentalStaffId: cs.dentalStaff.dentalStaffId,
                    imagingPlanesId: cs.imagingPlanes.imagingPlanesId,
                    date: new Date(cs.date),
                }
                var cTResultAbnormality = $scope.showCTResultAbnormality(cs.appointmentCTResultId)
                $scope.formCTResultAbnormality = {
                    ctresultAbnormalityId: cTResultAbnormality.ctresultAbnormalityId,
                    abnormalityId: cTResultAbnormality.abnormality.abnormalityId,
                    appointmentCTResult: cTResultAbnormality.appointmentCTResult.appointmentCTResultId
                }
            }
            const firstTabButtonCreate = document.getElementById('form-tab-ct-result');
            firstTabButtonCreate.click();
        }

        $scope.createCTResult = () => {
            console.log("id: ", $scope.formCTResult.appointmentCTResultId);
            if ($scope.formCTResult.appointmentCTResultId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                });
                return;
            }

            // Thêm hình ảnh

            // var formData = new FormData();
            // var fileInput = document.getElementById('imageInput');

            // if (fileInput.files.length > 0) {
            //     formData.append('file', fileInput.files[0]);

            //     // Tải hình ảnh lên server
            //     $http.post(url+'/uploadImage', formData, {
            //         headers: { 'Content-Type': undefined },
            //         transformRequest: angular.identity
            //     }).then(function (response) {
            //         // Nhận tên hình ảnh từ server
            //         $scope.formCTResult.image = response.data; // Giả sử server trả về tên file

            //         // Thực hiện tạo mới CTResult
            //         $http.post('/api/appointmentCTResult', $scope.formCTResult)
            //             .then(function (response) {
            //                 Swal.fire({
            //                     title: "Thành công!",
            //                     html: "Kết quả CT đã được tạo mới!",
            //                     icon: "success"
            //                 });
            //                 $scope.resetForm(); // Làm mới form
            //             }).catch(function (error) {
            //                 Swal.fire({
            //                     title: "Lỗi!",
            //                     html: "Có lỗi xảy ra khi tạo mới kết quả CT.",
            //                     icon: "error"
            //                 });
            //             });
            //     }).catch(function (error) {
            //         Swal.fire({
            //             title: "Lỗi!",
            //             html: "Có lỗi xảy ra khi tải lên hình ảnh.",
            //             icon: "error"
            //         });
            //     });
            // } else {
            //     // Nếu không có hình ảnh thì thực hiện lưu kết quả CT mà không có hình ảnh
            //     $http.post('/api/appointmentCTResult', $scope.formCTResult)
            //         .then(function (response) {
            //             Swal.fire({
            //                 title: "Thành công!",
            //                 html: "Kết quả CT đã được tạo mới!",
            //                 icon: "success"
            //             });
            //             $scope.resetForm(); // Làm mới form
            //         }).catch(function (error) {
            //             Swal.fire({
            //                 title: "Lỗi!",
            //                 html: "Có lỗi xảy ra khi tạo mới kết quả CT.",
            //                 icon: "error"
            //             });
            //         });
            // }
            var valid = $scope.validationForm();
            if (valid) {
                var requestCTResultJSON = angular.toJson($scope.formCTResult);
                $http.post(url + '/appointment-ct-result', requestCTResultJSON).then(response => {
                    // Bắt đầu thêm bất thường của film chụp
                    $scope.formCTResultAbnormality.appointmentCTResult = response.data.appointmentCTResultId;
                    var requestCTResultAbnormalityJSON = angular.toJson($scope.formCTResultAbnormality);

                    $http.post(url + '/ct-result-abnormality', requestCTResultAbnormalityJSON).then(response => {
                        // Cả hai lời gọi HTTP đều hoàn thành
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã thêm phim chụp thành công!",
                            icon: "success"
                        });
                        $scope.resetForm();
                        $scope.getListCTResultAbnormalities();
                        $scope.getListCTResults();

                        const secondTabButtonCreate = document.getElementById('list-tab-ct-result');
                        secondTabButtonCreate.click();
                    }).catch(err => {
                        Swal.fire({
                            title: "Thêm bất thường thất bại!",
                            html: '<p class="text-danger">Xảy ra lỗi!</p>',
                            icon: "error"
                        });
                    });
                    // Kết thúc thêm bất thường của film chụp
                }).catch(err => {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Xảy ra lỗi!</p>',
                        icon: "error"
                    });
                });
            }
        };


        $scope.updateCTResult = () => {
            if ($scope.formCTResult.appointmentCTResultId == -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                var requestCTResultJSON = angular.toJson($scope.formCTResult)
                var appointmentCTResultId = $scope.formCTResult.appointmentCTResultId
                var requestCTResultAbnormalityJSON = angular.toJson($scope.formCTResultAbnormality);
                $http.put(url + '/ct-result-abnormality/' + $scope.formCTResultAbnormality.ctresultAbnormalityId, requestCTResultAbnormalityJSON).then(function (response) {

                })
                $http.put(url + '/appointment-ct-result/' + appointmentCTResultId, requestCTResultJSON).then(respone => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Cập nhật thành công!",
                        icon: "success"
                    })
                    $scope.resetForm()
                    $scope.getListCTResultAbnormalities()
                    $scope.getListCTResults()
                    const secondTabButtonCreate = document.getElementById('list-tab-ct-result');
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

        $scope.deleteCTResult = (cs, $event) => {
            $event.preventDefault()
            console.log("delete ct result", cs)
            var appointmentCTResultId = cs.appointmentCTResultId
            Swal.fire({
                text: "Bạn có muốn xóa ảnh này ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-appointment-ct-result/' + appointmentCTResultId).then(respone => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        })
                        $scope.getListCTResults()
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
            console.log("RESET")
            $scope.formCTResult = {
                image: '',
                appointmentCTResultId: -1,
                dentalStaffId: '',
                AppointmentId: '',
                imagingPlanesId: '',
                date: new Date("01/01/2024"),
            }
            $scope.formCTResultAbnormality = {
                ctresultAbnormalityId: -1,
                abnormalityId: '',
                appointmentCTResult: '',
                description: '',
            }
            $('#imagingPlanesId').val(null).trigger('change');
            $('#appointmentId').val(null).trigger('change');
            $('#dentalStaffId').val(null).trigger('change');
            $('#abnormalityId').val(null).trigger('change');
        }
    }

    $scope.initializeUIComponents()
    $scope.getListAbnormalities()
    $scope.getListAppointments()
    $scope.getListDentalStaffs()
    $scope.getListImagingPlanes()
    $scope.getListCTResultAbnormalities()
    $scope.getListCTResults()
    $scope.crudCTResult()
})