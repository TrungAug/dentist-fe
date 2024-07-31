app.controller('AdminShiftController', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.listTimmeOfShiftDB = []
    $scope.listTimmeOfShiftFilerByShiftId = []
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
                    format: 'MM/DD/YYYY'
                }
            });
        $('.time-input').timepicker(
            {
                'scrollDefault': 'now',
                'zindex': '9999',
                'timeFormat': 'HH:mm',
                //'minTime': new Date().toTimeString().slice(0, 5),//áp dụng cho khách,bác sĩ chọn lịch
                'minTime': '7:30',
                'maxTime': '21:00',
                'step': 30,
                'disableTextInput': true

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

    }
    $scope.getListShift = () => {
        $http.get(url + '/shift').then(respone => {
            $scope.listShiftDB = respone.data
            console.log("listShiftDB", $scope.listShiftDB);
            if ($.fn.DataTable.isDataTable('#dataTable-list-shift')) {
                $('#dataTable-list-shift').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-shift').DataTable({
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
    $scope.getListTimeOfShift = () => {
        $http.get(url + '/time-of-shift').then(respone => {
            $scope.listTimmeOfShiftDB = respone.data
            console.log("listTimeOfShiftDB", $scope.listTimmeOfShiftDB);
        }).catch(err => {
            console.log("Error", err);
        })
    }
    $scope.getTimmeOfShiftFilerByShiftId = (shift) => {
        return $scope.listTimmeOfShiftDB.filter(tos => shift.shiftId === tos.shift.shiftId)
    }

    $scope.crudShift = () => {

        $scope.formShift = {
            shiftId: -1,
            shiftName: '',
            description: '',
        }
        var currentTime = moment();
        var remainder = 30 - (currentTime.minutes() % 30);
        var beginTime = moment(currentTime).add(remainder, 'minutes').format('HH:mm')
        $scope.formTimeOfShift = {
            shiftId: -1,
            //beginTime: beginTime, //áp dụng cho bsi va khach dat lich
            beginTime: '7:30',
            endTime: '21:00'
        };

        $scope.validationForm = () => {
            var valid = true
            if ($scope.formShift.shiftName == "" || $scope.formShift.shiftName == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập ca làm việc!",
                    icon: "error"
                })
                valid = false
            }
            return valid
        }
        $scope.caculatorTimeDiff = (beginTimeValue, endTimeValue) => {
            var validTime = true
            var beginTime = new Date();
            var endTime = new Date();

            var beginHours = parseInt(beginTimeValue.split(':')[0], 10);
            var beginMinutes = parseInt(beginTimeValue.split(':')[1], 10);
            beginTime.setHours(beginHours, beginMinutes, 0, 0);

            var endHours = parseInt(endTimeValue.split(':')[0], 10);
            var endMinutes = parseInt(endTimeValue.split(':')[1], 10);
            endTime.setHours(endHours, endMinutes, 0, 0);

            var timeDiff = endTime - beginTime;

            var hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff == 0) {
                Swal.fire({
                    title: "Thất bại!",
                    html: '<p class="text-danger">Giờ kết thúc làm việc phải sau giờ bắt đầu!</p>',
                    icon: "error"
                })
                validTime = false
            }
            // if (hoursDiff > 4) {
            //     Swal.fire({
            //         title: "Thất bại!",
            //         html: '<p class="text-danger">Ca làm việc không quá 4 tiếng!</p>',
            //         icon: "error"
            //     })
            //     return
            // }
            console.log('Số giờ làm việc:', hoursDiff);
            return validTime
        }

        $scope.editShift = (shift, $event) => {
            console.log("shift", shift);
            $event.preventDefault()
            if (shift != null) {
                $scope.formShift.shiftId = shift.shiftId
                $scope.formShift.description = shift.description
                $scope.formShift.shiftName = shift.name

                $scope.listTimmeOfShiftFilerByShiftId = $scope.getTimmeOfShiftFilerByShiftId(shift)
                $scope.formTimeOfShift.beginTime = moment($scope.listTimmeOfShiftFilerByShiftId[0].beginTime, "HH:mm:ss").format("HH:mm")
                $scope.formTimeOfShift.endTime = moment($scope.listTimmeOfShiftFilerByShiftId[0].endTime, "HH:mm:ss").format("HH:mm")
                $scope.formTimeOfShift.shiftId = $scope.listTimmeOfShiftFilerByShiftId[0].shift.shiftId
                $scope.formTimeOfShift.timeOfShiftId = $scope.listTimmeOfShiftFilerByShiftId[0].timeOfShiftId

                console.log("$scope.formTimeOfShift edit", $scope.formTimeOfShift);
                console.log("$scope.listTimmeOfShiftFilerByShiftId", $scope.listTimmeOfShiftFilerByShiftId);
            }
            const firstTabButtonShift = document.getElementById('form-tab-shift');
            firstTabButtonShift.click();
        }

        $scope.createShift = () => {
            var beginTimeValue = $('#beginTimeOfShift').val();
            var endTimeValue = $('#endTimeOfShift').val();
            //$scope.caculatorTimeDiff(beginTimeValue, endTimeValue)
            if ($scope.formShift.shiftId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            var validTime = $scope.caculatorTimeDiff(beginTimeValue, endTimeValue)

            if (valid && validTime) {
                var requsetshiftJSON = angular.toJson($scope.formShift)
                console.log("requsetshiftJSON", requsetshiftJSON);
                $http.post(url + '/shift', requsetshiftJSON).then(respone => {
                    // console.log("respone",respone);
                    $scope.formTimeOfShift.beginTime = moment(beginTimeValue, "HH:mm").format("HH:mm:ss")
                    $scope.formTimeOfShift.endTime = moment(endTimeValue, "HH:mm").format("HH:mm:ss")
                    $scope.formTimeOfShift.shiftId = respone.data.shiftId
                    var requsetformTimeOfShiftJSON = angular.toJson($scope.formTimeOfShift)
                    console.log("formTimeOfShift", requsetformTimeOfShiftJSON);
                    $http.post(url + '/time-of-shift', requsetformTimeOfShiftJSON).then(res => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Thêm ca làm việc thành công!",
                            icon: "success"
                        })
                        $scope.resetForm()
                        $scope.getListShift()
                        const secondTabButtonShift = document.getElementById('list-tab-shift');
                        secondTabButtonShift.click();
                    }).catch(err => {
                        console.log("error", err);
                        Swal.fire({
                            title: "Thất bại!",
                            html: '<p class="text-danger">Xảy ra lỗi khi thêm giờ làm!</p>',
                            icon: "error"
                        })
                    })
                }).catch(err => {
                    console.log("Error", err);
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Xảy ra lỗi!</p>',
                        icon: "error"
                    })
                });
            }
        }

        $scope.updateShift = () => {
            var beginTimeValue = $('#beginTimeOfShift').val();
            var endTimeValue = $('#endTimeOfShift').val();
            //
            $scope.formTimeOfShift.beginTime = moment(beginTimeValue, "HH:mm").format("HH:mm:ss")
            $scope.formTimeOfShift.endTime = moment(endTimeValue, "HH:mm").format("HH:mm:ss")
            $scope.formTimeOfShift.shiftId = respone.data.shiftId
            var timeOfShiftId = $scope.formTimeOfShift.timeOfShiftId
            var requsetformTimeOfShiftJSON = angular.toJson($scope.formTimeOfShift)
            var requsetformTimeOfShiftJSON = angular.toJson($scope.formTimeOfShift)
            console.log("formTimeOfShift update", requsetformTimeOfShiftJSON);
            //
     
            // if ($scope.formShift.shiftId == -1) {
            //     Swal.fire({
            //         title: "Cảnh báo!",
            //         html: "Thông tin chưa có trên hệ thống!",
            //         icon: "error"
            //     })
            //     return
            // }
            // var validForm = $scope.validationForm()
            // var validTime = $scope.caculatorTimeDiff(beginTimeValue, endTimeValue)
            // if (validForm && validTime) {
            //     var requsetshiftJSON = angular.toJson($scope.formShift)
            //     var shiftId = $scope.formShift.shiftId
            //     $http.put(url + '/shift/' + shiftId, requsetshiftJSON).then(respone => {
            //         $scope.formTimeOfShift.beginTime = moment(beginTimeValue, "HH:mm").format("HH:mm:ss")
            //         $scope.formTimeOfShift.endTime = moment(endTimeValue, "HH:mm").format("HH:mm:ss")
            //         $scope.formTimeOfShift.shiftId = respone.data.shiftId
            //         var timeOfShiftId = $scope.formTimeOfShift.timeOfShiftId
            //         var requsetformTimeOfShiftJSON = angular.toJson($scope.formTimeOfShift)
            //         console.log("formTimeOfShift", requsetformTimeOfShiftJSON);
            //         $http.put(url + '/time-of-shift/' + timeOfShiftId, requsetformTimeOfShiftJSON).then(res => {
            //             Swal.fire({
            //                 title: "Thành công!",
            //                 html: "Cập nhật thành công!",
            //                 icon: "success"
            //             })
            //             $scope.resetForm()
            //             $scope.getListShift()
            //             const secondTabButtonShiftUpdate = document.getElementById('list-tab-shift');
            //             secondTabButtonShiftUpdate.click();
            //         }).catch(err => {
            //             console.log("error", err);
            //             Swal.fire({
            //                 title: "Thất bại!",
            //                 html: '<p class="text-danger">Xảy ra lỗi khi cập nhật giờ làm!</p>',
            //                 icon: "error"
            //             })
            //         })

            //     }).catch(err => {
            //         console.log("Error", err);
            //         Swal.fire({
            //             title: "Thất bại!",
            //             html: '<p class="text-danger">Cập nhật thất bại!</p>',
            //             icon: "error"
            //         })
            //     })
            // }
        }

        $scope.deleteShift = (shift, $event) => {
            $event.preventDefault()
            console.log("delete shift", shift)
            var shiftId = shift.shiftId
            Swal.fire({
                text: "Bạn có muốn xóa Ca làm " + shift.name + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/sort-delete-shift/' + shiftId).then(respone => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã xóa thành công!",
                            icon: "success"
                        })
                        $scope.getListShift()
                    }).catch(err => {
                        console.log("Error: ", err);
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
            $scope.formShift = {
                shiftId: -1,
                shiftName: '',
                description: '',
            }
            $scope.formTimeOfShift = {
                shiftId: -1,
                timeOfShiftId: -1,
                beginTime: '7:30',
                endTime: '21:00'
            };
        }
    }


    $scope.initializeUIComponents()
    $scope.getListShift()
    $scope.getListTimeOfShift()
    $scope.crudShift()

})