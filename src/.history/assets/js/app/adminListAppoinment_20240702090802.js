app.controller('AdminListAppoinment', function ($scope, $http, $rootScope, $location, $timeout, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    var defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.selectedDoctors = []
    $scope.selectedDates = []
    $scope.listAppointmentStatusBD = []

    $scope.setupTab = () => {
        $scope.currentTab = -1;
        $scope.selectTab = (tab, $event) => {
            $event.preventDefault()
            $scope.currentTab = tab;
        }
        $scope.isSelected = (tab) => {
            return $scope.currentTab === tab;
        }
    }

    // $scope.setupSubtab = () => {
    //     $scope.currentTab = { shiftId: -1, doctorId: -1 };
    //     $scope.selectSubTab = (shiftId, doctorId, $event) => {
    //         var dateSelected = moment($scope.formAppointmentRequest.appointmentDate, "DD/MM/YYYY").toDate();
    //         console.log("dateSelected", dateSelected);
    //         $scope.formAppointmentRequest.doctorId = doctorId
    //         $event.preventDefault();
    //         $scope.currentTab = { shiftId: shiftId, doctorId: doctorId };
    //         $scope.timeOfShiftDB(shiftId, dateSelected, doctorId)
    //             .then(function (data) {
    //                 var currentTimeInSeconds = $scope.getCurrentTimeInSeconds()
    //                 $scope.listTOS = data.filter((tos) => {
    //                     var beginTimeInSeconds = $scope.timeStringToSeconds(tos[1].beginTime);
    //                     return beginTimeInSeconds > currentTimeInSeconds;
    //                 });
    //                 console.log("$scope.listTOS okkkk", $scope.listTOS);
    //             })
    //             .catch(function (error) {
    //                 console.error('Có lỗi khi lấy dữ liệu theo shiftId ' + shiftId + ' và doctorId ' + doctorId + ':', error);
    //             });
    //     };
    //     $scope.isSelected = (shiftId, doctorId) => {
    //         return $scope.currentTab.shiftId === shiftId && $scope.currentTab.doctorId === doctorId;
    //     };
    // }

    $scope.initializeFullCalendar = () => {
        $scope.extractTimeFromISOString = (isoString) => {
            var timePart = isoString.split('T')[1];
            return timePart.slice(0, 5);
        }
        $scope.processDoctorUnavailabilityAllDoctor().then(result => {
            var events = result.map(item => {
                return {
                    title: item.appointment.patient ? item.appointment.patient.fullName : null,
                    date: item.date,
                    start: item.date ? `${item.date.split("T")[0]}T${item.timeOfShift.beginTime}` : null,
                    end: item.date ? `${item.date.split("T")[0]}T${item.timeOfShift.endTime}` : null,
                    doctor: item.appointment.doctor ? item.appointment.doctor.fullName : null,
                    patient: item.appointment.patient ? item.appointment.patient.fullName : null,
                    phoneNumber: item.appointment.patient ? item.appointment.patient.phoneNumber : null
                };
            });
            // console.log("result", result);
            // console.log("events", events);
            var calendarEl = document.getElementById('calendar-doctor-appoinment');
            if (calendarEl) {
                var calendar = new FullCalendar.Calendar(calendarEl,
                    {
                        plugins: ['dayGrid', 'timeGrid', 'list', 'bootstrap'],
                        timeZone: 'Asia/Ho_Chi_Minh',
                        themeSystem: 'bootstrap',
                        header:
                        {
                            left: 'today, prev, next',
                            center: 'title',
                            right: 'timeGridDay,listMonth',
                        },
                        defaultView: 'timeGridDay',
                        buttonIcons:
                        {
                            prev: 'fe-arrow-left',
                            next: 'fe-arrow-right',
                            prevYear: 'left-double-arrow',
                            nextYear: 'right-double-arrow'
                        },
                        weekNumbers: true,
                        eventLimit: true,
                        locale: 'vi',
                        buttonText: {
                            today: 'Hôm nay',
                            month: 'Tháng',
                            week: 'Tuần',
                            day: 'Ngày',
                            list: 'Lịch sử'
                        },
                        slotLabelFormat: {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        },
                        slotMinTime: '06:00:00',
                        slotMaxTime: '21:00:00',
                        events: events,
                        eventClick: function (info) {
                            console.log("info", info);
                            var timeStart = $scope.extractTimeFromISOString(info.event.start.toISOString())
                            var timeEnd = info.event.end ? $scope.extractTimeFromISOString(info.event.end.toISOString()) : 'N/A';
                            var eventDetails =
                                '<strong>Tên bác sĩ:</strong> ' + info.event.extendedProps.doctor + '<br>' +
                                '<strong>Bệnh nhân:</strong> ' + info.event.extendedProps.patient + ' - ' + info.event.extendedProps.phoneNumber
                                + '<br>' +
                                '<strong>Thời gian bắt đầu:</strong> ' + timeStart + '<br>' +
                                '<strong>Thời gian kết thúc:</strong> ' + timeEnd;
                            document.getElementById('eventDetailsListAppoinmentBody').innerHTML = eventDetails;
                            const btnEventDetailsListAppoinment = document.getElementById('btnEventDetailsListAppoinment');
                            btnEventDetailsListAppoinment.click();
                        }
                    });
                calendar.render();
            }
        });

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
                singleDatePicker: false,
                timePicker: false,
                showDropdowns: true,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
                // isInvalidDate: function (date) {
                //     return registeredDates.includes(date.format('YYYY-MM-DD'));
                // }
            }
        );
        $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = $('#formAppoinmentSearchDate').val();
            $scope.getDateFilter(selectedDate)
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

    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
            console.log("$scope.listDoctorDB", $scope.listDoctorDB);
            //$scope.initializeCalendars()
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getDoctorFilter = (doctorId) => {

        var index = $scope.selectedDoctors.indexOf(doctorId)
        if (index === -1) {
            $scope.selectedDoctors.push(doctorId)
        } else {
            $scope.selectedDoctors.splice(index, 1)
        }
        $rootScope.$broadcast('getDoctorFilter', doctorId);
        $scope.getListDoctorUnavailabilityAllDoctor()
        $scope.initializeFullCalendar()
    }

    $scope.getDateFilter = (selectedDate) => {
        console.log("selectedDate", selectedDate);
        $scope.selectedDates = [];
        var dates = selectedDate.split(' - ');
        var fromDate = moment(dates[0], 'DD/MM/YYYY');
        var toDate = moment(dates[1], 'DD/MM/YYYY');
        while (fromDate <= toDate) {
            $scope.selectedDates.push(moment(fromDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
            fromDate = fromDate.add(1, 'days');
        }
        $scope.getListDoctorUnavailabilityAllDoctor()
        $scope.initializeFullCalendar()
    }

    $scope.getListDoctorUnavailabilityAllDoctor = () => {
        $scope.processDoctorUnavailabilityAllDoctor().then(result => {
            $scope.listDoctorUnavailabilityAllDoctorDB = result
            console.log("$scope.listDoctorUnavailabilityAllDoctorDB", $scope.listDoctorUnavailabilityAllDoctorDB);
            $timeout(() => {
                if ($.fn.DataTable.isDataTable('#dataTable-list-appoinment')) {
                    $('#dataTable-list-appoinment').DataTable().clear().destroy();
                }
                $(document).ready(function () {
                    $('#dataTable-list-appoinment').DataTable({
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
                    })
                })


            }, 0)
        })
    }

    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status').then(resp => {
            $scope.listAppointmentStatusBD = resp.data
        })
    }

    $scope.processDoctorUnavailabilityAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability').then((response) => {
                var filteredData = response.data;
                if ($scope.selectedDoctors.length > 0) {
                    filteredData = filteredData.filter(item => {
                        return $scope.selectedDoctors.includes(item.appointment.doctor.doctorId);
                    });
                }
                if ($scope.selectedDates.length > 0) {
                    filteredData = filteredData.filter(item => {
                        return $scope.selectedDates.includes(moment(item.date).format("YYYY-MM-DD"));
                    });
                }
                resolve(filteredData)
            }).catch((error) => reject(error))
        })
    }

    $scope.editAppoinment = (appointment, $event) => {
        $event.preventDefault()
        if (appointment != null) {
            console.log("appointment", appointment);
        }
        const formTab = document.getElementById('form-tab-appoinment');
        formTab.click();
    }

    $scope.refresh = () => {
        $route.reload()
        $timeout(function () {
            const tabLink = document.querySelector('.nav-link[ng-click*="selectTab(-2"]')
            tabLink.click();
        }, 1000)
    }

    $scope.isDisabled = function (status) {
        return ['Hoàn Thành', 'Đã Hủy', 'Không Đến', 'Hoãn'].includes(status);
    }

    $scope.initData = () => {
        $scope.formAppointmentRequest = {
            patientId: -1,
            appointmentStatus: -1,
            appointmentType: "",
            doctorId: -1,
            dentalStaffId: -1,
            appointmentDate: null,
            note: "",
            createAt: null,
            //isDeleted: false,
            appointmentPatientRecord: -1
        }
        $scope.formDoctorUnavailabilityRequest = {
            description: "",
            timeOfShiftId: -1,
            appointmentId: -1,
            date: null,
            //isDeleted: false
        }

        $scope.formAppointmentPatientRecordRequest = {
            patientId: -1,
            createAt: null,
            currentCondition: "",// Nếu trạng thái hoàn thành cho nhập
            reExamination: "",//// Nếu trạng thái hoàn thành cho nhập
            // isDeleted: false
        }
    }

    $scope.updateStatus = (app, statusId) => {
        var originalStatus = $scope.listAppointmentStatusBD.find(s => s.status === app.appointment.appointmentStatus.status)//status trong app đã thay đổi id nhưng status chưa thay đổi, dựa vào đây để lấy lại statusId cũ
        var statusUpdate = $scope.listAppointmentStatusBD.find(s => s.appointment_StatusId === statusId)
        if (statusUpdate) {
            switch (statusUpdate.status.toLowerCase()) {
                case 'đã hủy':
                case 'không đến':
                case 'hoãn':
                    Swal.fire({
                        title: 'Cập nhận trạng thái cuộc hẹn',
                        html: 'Trạng thái cuộc hẹn cập nhật sang: ' + '<p class="text-warning">' + statusUpdate.status + '</p>',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Đồng ý',
                        cancelButtonText: 'Hủy bỏ'
                    }).then(rs => {
                        if (rs.dismiss === Swal.DismissReason.cancel) {
                            $scope.$apply(function() {
                                app.appointment.appointmentStatus.appointment_StatusId = originalStatus.appointment_StatusId
                            })
                        } else 
                        if (rs.isConfirmed) {
                            var isDeleted = true
                            var currentCondition = ""
                            var reExamination = ""
                            $scope.updateAppoinmentToDB(app, statusId, isDeleted, currentCondition, reExamination)
                        }
                    })
                    break;
                case 'đang diễn ra':
                case 'đã đặt':
                case 'đã xác nhận':
                    Swal.fire({
                        title: 'Cập nhận trạng thái cuộc hẹn',
                        html: 'Trạng thái cuộc hẹn cập nhật sang: ' + '<p class="text-warning">' + statusUpdate.status + '</p>',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Đồng ý',
                        cancelButtonText: 'Hủy bỏ'
                    }).then(rs => {
                        if (rs.dismiss === Swal.DismissReason.cancel) {
                            $scope.$apply(function() {
                                app.appointment.appointmentStatus.appointment_StatusId = originalStatus.appointment_StatusId
                            })
                        } else
                        if (rs.isConfirmed) {
                            var isDeleted = false
                            var currentCondition = ""
                            var reExamination = ""
                            $scope.updateAppoinmentToDB(app, statusId, isDeleted, currentCondition, reExamination)
                        }
                    })
                    break;
                case 'hoàn thành':
                    Swal.fire({
                        title: 'Cập nhận trạng thái cuộc hẹn',
                        html: 'Trạng thái cuộc hẹn cập nhật sang: ' + '<p class="text-warning">' + statusUpdate.status + '</p>',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Đồng ý',
                        cancelButtonText: 'Hủy bỏ'
                    }).then(async (rs) => {
                        if (rs.dismiss === Swal.DismissReason.cancel) {
                            $scope.$apply(function() {
                                app.appointment.appointmentStatus.appointment_StatusId = originalStatus.appointment_StatusId
                            })
                        } else
                        if (rs.isConfirmed) {
                            const { value: formValues } = await Swal.fire({
                                title: "Nhập thông tin",
                                html: `
                                <div class="row d-flex flex-column flex-wrap">
                                    <div class="col">
                                        <div class="form-floating mb-3">
                                            <textarea class="form-control" id="currentCondition"
                                                style="height: 100px;"></textarea>
                                            <label for="currentCondition">Kết quả khám</label>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-floating mb-3">
                                            <input class="form-control"id="reExamination"></input>
                                            <label for="reExamination">Hẹn tái khám</label>
                                        </div>                              
                                    </div>
                                </div>                              
                                `,
                                focusConfirm: false,
                                preConfirm: () => {
                                    return [
                                        document.getElementById("currentCondition").value,
                                        document.getElementById("reExamination").value
                                    ];
                                }
                            });
                            if (formValues) {
                                //Swal.fire(JSON.stringify(formValues));
                                var isDeleted = false
                                var currentCondition = formValues[0]
                                var reExamination = formValues[1]
                                $scope.updateAppoinmentToDB(app, statusId, isDeleted, currentCondition, reExamination)
                            }
                        }
                    })
                    break;
                default:
                    console.log("Trạng thái không xác định:", statusUpdate.status);
                    break;
            }
        } else {
            console.log("Không tìm thấy trạng thái với statusId:", statusId);
        }
    }

    $scope.updateAppoinmentToDB = async (app, statusId, isDeleted, currentCondition, reExamination) => {
        try {
            var dataAppointmentRequestJSON = angular.toJson($scope.getDataAppointmentRequest(app, statusId, isDeleted))
            var dataDoctorUnavailabilityRequest = angular.toJson($scope.getDataDoctorUnavailabilityRequest(app, isDeleted))
            var dataAppointmentPatientRecordRequest = angular.toJson($scope.getDataAppointmentPatientRecordRequest(app, isDeleted, currentCondition, reExamination))

            console.log("dataAppointmentRequestJSON", dataAppointmentRequestJSON);

            const promises = [
                $http.put(url + '/appointment-patient-record/' + app.appointment.appointmentPatientRecord.appointmentPatientRecordId, dataAppointmentPatientRecordRequest),
                $http.put(url + '/appointment/' + app.appointment.appointmentId, dataAppointmentRequestJSON),
                $http.put(url + '/doctorUnavailability/' + app.doctorUnavailabilityId, dataDoctorUnavailabilityRequest)
            ]
            const [response, resp, res] = await Promise.all(promises)
            console.log("response appointment-patient-record", response.data);
            console.log("resp appointment", resp.data);
            console.log("res doctorUnavailability", res.data);
            Swal.fire({
                title: 'Cập nhật thành công',
                text: 'Thông tin cuộc hẹn đã được cập nhật thành công.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $scope.refresh()
                }
            })
        } catch (err) {
            console.log("Lỗi khi cập nhật trạng thái cuộc hẹn", err);
        }
    }

    $scope.getDataAppointmentRequest = (app, statusId, isDeleted) => {
        $scope.formAppointmentRequest = {
            patientId: app.appointment.patient ? app.appointment.patient.patientId : null,
            appointmentStatus: statusId,
            appointmentType: app.appointment.appointmentType.appointment_TypeId,
            doctorId: app.appointment.doctor ? app.appointment.doctor.doctorId : null,
            dentalStaffId: app.appointment.dentalStaff ? app.appointment.dentalStaff.dentalStaffId : null,
            appointmentDate: TimezoneService.convertToTimezone(moment(app.appointment.appointmentDate).toDate(), defaultTimezone),
            note: app.appointment.note,
            createAt: app.appointment.createAt,
            isDeleted: isDeleted,
            appointmentPatientRecord: app.appointment.appointmentPatientRecord.appointmentPatientRecordId
        }
        return $scope.formAppointmentRequest
    }

    $scope.getDataDoctorUnavailabilityRequest = (app, isDeleted) => {
        $scope.formDoctorUnavailabilityRequest = {
            description: app.appointment.description,
            timeOfShiftId: app.timeOfShift.timeOfShiftId,
            appointmentId: app.appointment.appointmentId,
            date: app.date,
            isDeleted: isDeleted
        }
        return $scope.formDoctorUnavailabilityRequest
    }

    $scope.getDataAppointmentPatientRecordRequest = (app, isDeleted, currentCondition, reExamination) => {
        $scope.formAppointmentPatientRecordRequest = {
            patientId: app.appointment.patient ? app.appointment.patient.patientId : null,
            createAt: app.appointment.createAt,
            currentCondition: currentCondition,// Nếu trạng thái hoàn thành cho nhập
            reExamination: reExamination,//// Nếu trạng thái hoàn thành cho nhập
            isDeleted: isDeleted
        }
        return $scope.formAppointmentPatientRecordRequest
    }



    $scope.setupTab()
    $scope.initData()
    $scope.getListDoctor()
    $scope.getListDoctorUnavailabilityAllDoctor()
    $scope.getListAppointmentStatus()
    $scope.initializeFullCalendar()
    $scope.initializeUIComponents()

    $scope.initializeCalendars = () => {
        $timeout(() => {
            angular.forEach($scope.listDoctorDB, (doctor) => {
                var calendarId = 'calendar-doctor-' + doctor.doctorId;
                $scope.initializeFullCalendar(calendarId, doctor.doctorId);
            }
            )
        })
    }



})