app.controller('AdminDoctorScheduleController', function ($scope, $http, $rootScope, $location, $timeout, $window, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    var defaultTimezone = "Asia/Ho_Chi_Minh"
    var selecteShiftdValues = ""
    $scope.listDoctorScheduleDB = ""
    var registeredDates = ""
    var doctorId = 2
    $scope.isChangeSchedule = false
    $scope.selectedDoctors = []
    $scope.selectedShifts = []
    $scope.startDate = ""
    $scope.endDate = ""

    $scope.getListShift = () => {
        $http.get(url + "/shift").then(respone => {
            $scope.listShiftDB = respone.data
        }).catch(err => {
            console.log("error", err);
        })
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getDoctor = (doctorId) => {
        var index = $scope.selectedDoctors.indexOf(doctorId)
        if (index === -1) {
            $scope.selectedDoctors.push(doctorId)
        } else {
            $scope.selectedDoctors.splice(index, 1)
        }
    }

    $scope.getShift = (shiftId) => {
        var index = $scope.selectedShifts.indexOf(shiftId)
        if (index === -1) {
            $scope.selectedShifts.push(shiftId)
        } else {
            $scope.selectedShifts.splice(index, 1)
        }
    }

    $scope.initializeCalendarRegisterDoctorSchedule = () => {
        $scope.getListDoctorScheduleAllDoctor().then(result => {
            var calendarEl = document.getElementById('calendar-register-doctor-schedule');
            var calendar = new FullCalendar2.Calendar(calendarEl, {
                timeZone: 'Asia/Ho_Chi_Minh',
                themeSystem: 'bootstrap',
                locale: 'vi',
                buttonText: {
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    list: 'Lịch sử'
                },
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                navLinks: true, // can click day/week names to navigate views
                selectable: true,
                selectMirror: true,
                select: function (arg) {
                    $scope.startDate = TimezoneService.convertToTimezone(arg.start, defaultTimezone)
                    $scope.endDate = TimezoneService.convertToTimezone(arg.end, defaultTimezone)
                    $scope.$apply();
                    const btnEventDetailsListAppoinment = document.getElementById('btnRegisterDoctorSchedule');
                    btnEventDetailsListAppoinment.click();
                    console.log("$scope.startDate", $scope.startDate);
                    console.log("$scope.selectedDoctors", $scope.selectedDoctors);
                    // var title = prompt('Event Title:');
                    // if (title) {
                    //     calendar.addEvent({
                    //         title: title,
                    //         start: arg.start,
                    //         end: arg.end,
                    //         allDay: arg.allDay
                    //     })
                    // }

                    calendar.unselect()
                },
                eventClick: function (arg) {
                    if (confirm('Are you sure you want to delete this event?')) {
                        arg.event.remove()
                    }
                },
                editable: true,
                dayMaxEvents: true, // allow "more" link when too many events
                // events: [
                //     {
                //         title: 'All Day Event',
                //         start: '2023-01-01'
                //     },
                //     {
                //         title: 'Long Event',
                //         start: '2023-01-07',
                //         end: '2023-01-10'
                //     },
                //     {
                //         groupId: 999,
                //         title: 'Repeating Event',
                //         start: '2023-01-09T16:00:00'
                //     },
                //     {
                //         groupId: 999,
                //         title: 'Repeating Event',
                //         start: '2023-01-16T16:00:00'
                //     },
                //     {
                //         title: 'Conference',
                //         start: '2023-01-11',
                //         end: '2023-01-13'
                //     },
                //     {
                //         title: 'Meeting',
                //         start: '2023-01-12T10:30:00',
                //         end: '2023-01-12T12:30:00'
                //     },
                //     {
                //         title: 'Lunch',
                //         start: '2023-01-12T12:00:00'
                //     },
                //     {
                //         title: 'Meeting',
                //         start: '2023-01-12T14:30:00'
                //     },
                //     {
                //         title: 'Happy Hour',
                //         start: '2023-01-12T17:30:00'
                //     },
                //     {
                //         title: 'Dinner',
                //         start: '2023-01-12T20:00:00'
                //     },
                //     {
                //         title: 'Birthday Party',
                //         start: '2023-01-13T07:00:00'
                //     },
                //     {
                //         title: 'Click for Google',
                //         url: 'http://google.com/',
                //         start: '2023-01-28'
                //     }
                // ]
            });
            calendar.render();
        })
    }

    $scope.initializeFullCalendar = () => {
        $scope.extractTimeFromISOString = (isoString) => {
            var timePart = isoString.split('T')[1];
            return timePart.slice(0, 5);
        }
        $scope.processDoctorUnavailabilityByDoctor(doctorId).then(result => {
            result = result.filter(rs => rs.deleted === false)
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
            console.log("result", result);
            console.log("events", events);
            var calendarEl = document.getElementById('calendar-doctor-schedule');
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
                        },
                    });
                calendar.render();
            }
        });

    }

    $scope.initializeUIComponents = () => {
        $scope.getDateRegisetered()
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
                minDate: moment().add(1, 'days'),
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
                isInvalidDate: function (date) {
                    // Chặn các ngày trong mảng disabledDates
                    return registeredDates.includes(date.format('YYYY-MM-DD'));
                },
            }
        );
        $('.drgpickerSingle').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().add(1, 'days'),
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
                isInvalidDate: function (date) {
                    // Chặn các ngày trong mảng disabledDates
                    return registeredDates.includes(date.format('YYYY-MM-DD'));
                },
            }
        );
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

        $('#formDoctorScheduleShiftId').on('change', function () {
            $timeout(function () {
                var selectedVals = $('#formDoctorScheduleShiftId').val()
                selecteShiftdValues = processSelect2Service.processSelect2Data(selectedVals)
            });
        });

        $('#formDoctorScheduleShiftIdSingle').on('change', function () {
            $timeout(function () {
                var selectedVals = $('#formDoctorScheduleShiftIdSingle').val()
                selecteShiftdValues = processSelect2Service.processSelect2Data(selectedVals)
            });
        });
    }

    $scope.processDataDateRegistered = (doctorId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule').then(response => {
                var dates = response.data
                    .filter(item => item.doctor && item.doctor.doctorId === doctorId)
                    .map(item => item.date);
                var disabledDates = dates.filter(date => date !== null)
                disabledDates = disabledDates.map(date => moment(date).format('YYYY-MM-DD'))
                resolve(disabledDates)
            }).catch(err => {
                console.error('Error fetching doctor schedule:', err)
                reject(err)
            })
        })
    }

    $scope.getDateRegisetered = () => {
        //truyền id doctor khi login vào
        $scope.processDataDateRegistered(2).then(result => {
            registeredDates = result;
        }).catch(error => {
            console.error('Error getting registered dates:', error);
        })
    }

    $scope.getListDoctorScheduleByDoctor = (doctorId) => {
        $scope.processDoctorScheduleByDoctor(doctorId).then(result => {
            $scope.listDoctorScheduleByDoctorDB = result.sort((a, b) => {
                return new Date(b.date) - new Date(a.date)
            })
            $timeout(() => {
                if ($.fn.DataTable.isDataTable('#dataTable-list-schedule-by-doctor')) {
                    $('#dataTable-list-schedule-by-doctor').DataTable().clear().destroy();
                }
                $(document).ready(function () {
                    $('#dataTable-list-schedule-by-doctor').DataTable({
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

    $scope.getListDoctorScheduleAllDoctor = () => {
        $scope.processDoctorScheduleAllDoctor().then(result => {
            $scope.listDoctorScheduleAllDoctorDB = result
        })
    }


    $scope.processDoctorUnavailabilityByDoctor = (doctorId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability-by-doctor', { params: { doctorId: doctorId } }).then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    $scope.processDoctorScheduleByDoctor = (doctorId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-by-doctor-id/' + doctorId).then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    $scope.processDoctorScheduleAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-except-deleted').then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    $scope.comparasionDate = (selectDate) => {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);

        return selectDate.getTime() > date.getTime();
    }

    $scope.calculateWorkingHours = (beginTime, endTime) => {
        if (!beginTime || !endTime) return 0;

        const timeToMinutes = (time) => {
            const [hours, minutes, seconds] = time.split(':').map(Number);
            return hours * 60 + minutes + (seconds / 60);
        };

        const beginMinutes = timeToMinutes(beginTime);
        const endMinutes = timeToMinutes(endTime);

        let diffMinutes = endMinutes - beginMinutes;

        if (diffMinutes < 0) {
            diffMinutes += 24 * 60
        }

        const diffHours = diffMinutes / 60
        return diffHours;
    }

    // $scope.exportPDF = function () {
    //     const doc = new jsPDF();
    //     doc.autoTable({
    //         head: [['Ngày làm việc', 'Ca làm việc', 'Thời gian bắt đầu', 'Thời gian kết thúc', 'Số giờ làm']],
    //         body: $scope.listDoctorUnavailabilityByDoctorDB.map(ds => [
    //             ds.date,
    //             ds.shift ? 'Ca ' + ds.shift.name : '',
    //             ds.shift ? ds.shift.beginTime : '',
    //             ds.shift ? ds.shift.endTime : '',
    //             $scope.calculateWorkingHours(ds.shift.beginTime, ds.shift.endTime) + ' giờ'
    //         ]),
    //         startY: 20
    //     });
    //     doc.save('bang_lam_viec.pdf')
    // }

    $scope.crudDoctorSchedule = () => {

        $scope.formDoctorSchedule = {
            doctorScheduleId: -1,
            date: moment().add(1, 'days').format('DD/MM/YYYY'),
            shiftId: '',
            doctorId: '',
            available: true,
            createAt: new Date(),
            updateAt: ''
        }

        $scope.validationForm = () => {
            var valid = true
            if (selecteShiftdValues == "" || selecteShiftdValues == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn ca làm việc!",
                    icon: "error"
                })
                valid = false
            }
            return valid
        }

        $scope.isDoctorUnavailable = (doctorId, date, shiftId) => {
            return new Promise((resolve, reject) => {
                var filteredResults = null;
                $scope.processDoctorUnavailabilityByDoctor(doctorId).then(result => {
                    filteredResults = result.filter(du => du.date === date);
                    if (filteredResults) {
                        filteredResults = filteredResults.filter(du => du.timeOfShift.shift.shiftId === shiftId)
                    }
                    var isDoctorUnavailable = filteredResults && filteredResults.length > 0
                    resolve(isDoctorUnavailable)
                }).catch(err => {
                    reject(err)
                })
            })
        }

        $scope.getDateArray = (selectedDate) => {
            var dateArray = []
            if (selectedDate.includes('-')) {
                var dates = selectedDate.split(' - ')
                var fromDate = moment(dates[0], 'DD/MM/YYYY')
                var toDate = moment(dates[1], 'DD/MM/YYYY')
                while (fromDate <= toDate) {
                    dateArray.push(fromDate.format('DD/MM/YYYY'));
                    fromDate = fromDate.add(1, 'days')
                }
            } else {
                var singleDate = moment(selectedDate, 'DD/MM/YYYY')
                dateArray.push(singleDate.format('DD/MM/YYYY'))
            }
            return dateArray;
        }

        $scope.generateScheduleArray = (doctorId, dates, shiftIds) => {
            var scheduleArray = []
            dates.forEach(date => {
                shiftIds.forEach(shiftId => {
                    var scheduleObject = {
                        doctorId: doctorId,
                        date: moment(date, 'DD/MM/YYYY').toDate(),
                        shiftId: shiftId,
                        available: true,
                        createAt: new Date(),
                        updateAt: ''
                    }
                    scheduleArray.push(scheduleObject);
                })
            })
            return scheduleArray
        }

        $scope.removeMilliseconds = (dateString) => {
            if (!dateString) return dateString;
            return dateString.replace(/\.\d+/, '');
        }

        $scope.isExistDoctorSchedule = (date, shiftId, scheduleOrigin) => {
            return new Promise((resolve, reject) => {
                var filteredResults = null;
                var doctorId = scheduleOrigin.doctor.doctorId
                var convertedDate = TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone)
                $scope.processDoctorScheduleByDoctor(doctorId).then(result => {
                    filteredResults = result.filter(ds => {
                        //Xử lý chênh lệch ms nên không so sánh được
                        var dsDateWithoutMillis = $scope.removeMilliseconds(ds.date);
                        var convertedDateWithoutMillis = $scope.removeMilliseconds(convertedDate);
                        return dsDateWithoutMillis === convertedDateWithoutMillis
                    })
                    if (filteredResults) {
                        filteredResults = filteredResults.filter(ds => ds.shift.shiftId === shiftId)
                    }
                    var isExistDoctorSchedule = filteredResults && filteredResults.length > 0
                    resolve(isExistDoctorSchedule)
                }).catch(err => {
                    reject(err)
                })
            })
        }

        $scope.resetForm = () => {
            $scope.formDoctorSchedule = {
                date: moment().add(1, 'days').format('DD/MM/YYYY'),
                shiftId: '',
                doctorId: '',
                isAvailable: true,
                createAt: new Date(),
                updateAt: ''
            }
        }

        $scope.createDoctorSchedule = () => {
            var validForm = $scope.validationForm()
            if (validForm) {
                var selectedDate = $('#dateOfDoctorSchedule').val()
                var dates = $scope.getDateArray(selectedDate)
                var shiftIds = selecteShiftdValues;
                var dataArray = $scope.generateScheduleArray(doctorId, dates, shiftIds)
                dataArray.forEach(data => {
                    var requsetDataJSON = angular.toJson(data)
                    $http.post(url + '/doctor-schedule', data).then(response => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã đăng ký lịch làm việc cho ngày " + selectedDate,
                            icon: "success"
                        }).then(() => {
                            $window.location.reload(); // hoặc sử dụng $route.reload()
                        })
                        $scope.getDateRegisetered()
                        $scope.resetForm()
                    }).catch(error => {
                        Swal.fire({
                            title: "Thất bại!",
                            html: '<p class="text-danger">Xảy ra lỗi khi đăng ký lịch làm việc!</p>',
                            icon: "error"
                        })
                        console.log("error", error);
                    })
                });
            }

        }

        $scope.changeDoctorSchedule = async () => {
            var scheduleOrigin = $scope.formDoctorSchedule
            var selectedDate = $('#dateOfDoctorScheduleSingle').val()
            var date = $scope.getDateArray(selectedDate)[0]
            var shiftId = selecteShiftdValues && selecteShiftdValues.length > 0 ? selecteShiftdValues[0] : $scope.formDoctorSchedule.shiftId
            var isExistDoctorSchedule = false
            try {
                isExistDoctorSchedule = await $scope.isExistDoctorSchedule(date, shiftId, scheduleOrigin)
                if (isExistDoctorSchedule) {
                    Swal.fire({
                        title: "Cảnh báo!",
                        html: "Ca này bạn đã đăng ký. Vui lòng chọn ca khác!",
                        icon: "error"
                    })
                } else {
                    $scope.formDoctorSchedule = {
                        doctorScheduleId: scheduleOrigin.doctorScheduleId,
                        date: TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone),
                        shiftId: shiftId,
                        doctorId: scheduleOrigin.doctor.doctorId,
                        available: true,
                        createAt: scheduleOrigin.createAt,
                        updateAt: new Date()
                    }
                    var requsetDataJSON = angular.toJson($scope.formDoctorSchedule)
                    $http.put(url + '/doctor-schedule/' + $scope.formDoctorSchedule.doctorScheduleId, requsetDataJSON).then(response => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đổi lịch làm thành công",
                            icon: "success"
                        }).then(() => {
                            $route.reload()
                        })
                    }).catch(err => {
                        Swal.fire({
                            title: "Cảnh báo!",
                            html: "Lỗi khi thay đổi lịch làm việc!",
                            icon: "error"
                        })
                    })
                }
            } catch (e) {
                console.error("Lỗi kiểm tra lịch bác sĩ đã đăng ký:", e)
            }
        }

        $scope.cancelDoctorSchedule = async () => {
            var scheduleOrigin = $scope.formDoctorSchedule
            Swal.fire({
                text: "Bạn thật sự muốn Hủy ca làm việc ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-doctor-schedule/' + scheduleOrigin.doctorScheduleId).then(response => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Hủy lịch làm thành công",
                            icon: "success"
                        }).then(() => {
                            $route.reload()
                        })
                    }).catch(err => {
                        Swal.fire({
                            title: "Cảnh báo!",
                            html: "Lỗi khi hủy lịch làm việc!",
                            icon: "error"
                        })
                    })
                }
            })
        }

        $scope.changeSchedule = async (doctorSchedule) => {
            var ds = angular.copy(doctorSchedule)
            $scope.formDoctorSchedule = ds
            var isDoctorUnavailable = false;
            try {
                isDoctorUnavailable = await $scope.isDoctorUnavailable(doctorId, ds.date, ds.shift.shiftId);

                if (isDoctorUnavailable) {
                    Swal.fire({
                        title: "Cảnh báo!",
                        html: "Ca này đã có khách hàng đặt lịch, vui lòng liên hệ admin!",
                        icon: "error"
                    })
                } else {
                    $timeout(() => {
                        $scope.isChangeSchedule = true
                        $scope.formDoctorScheduleShow = ds
                        $scope.formDoctorSchedule.date = moment(ds.date).format('DD/MM/YYYY')
                        $scope.formDoctorSchedule.shiftId = ds.shift.shiftId
                        const btnRegisterSchedule = document.getElementById('v-pills-register-schedule-tab')
                        btnRegisterSchedule.click()
                    })
                }
            } catch (error) {
                console.error("Lỗi kiểm tra lịch bận của bác sĩ:", error)
            }
        }

    }

    $scope.getListShift()
    $scope.getListDoctor()
    $scope.initializeCalendarRegisterDoctorSchedule()
    $scope.initializeFullCalendar()
    $scope.initializeUIComponents()
    $scope.crudDoctorSchedule()
    $scope.getListDoctorScheduleByDoctor(doctorId)
});