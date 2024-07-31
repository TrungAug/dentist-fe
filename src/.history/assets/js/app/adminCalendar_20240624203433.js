console.log("AdminCalendar");
app.controller('AdminCalendar', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),

    }
    //code here

    $scope.setupTab = () => {
        $scope.currentTab = -1;
        $scope.selectTab = (shiftId, $event) => {
            $event.preventDefault()
            $scope.currentTab = shiftId;
            $scope.timeOfShiftDB(shiftId)
            .then(function(data) {
                $scope.listTOS = data;
            })
            .catch(function(error) {
                console.error('Có lỗi khi lấy dữ liệu theo ' + shiftId + ':', error);
            });
           
        }
        $scope.isSelected = (shiftId) => {
            return $scope.currentTab === shiftId;
        }
    }
    // $scope.saveAppoinment = () => {
    //     // Lấy ra các giá trị đã nhập từ các trường input
    //     var appoinmentTitle = $scope.appoinmentTitle;
    //     var appoinmentPantient = $scope.appoinmentPantient;
    //     var appoinmentService = $scope.appoinmentService;
    //     var appoinmentDoctor = $scope.appoinmentDoctor;
    //     var appoinmentStartDate = $scope.appointmentDate;
    //     var appoinmentStartTime = $scope.appointmentTime;
    //     var appoinmentEndDate = $scope.reexaminationDate;
    //     var appoinmentEndTime = $scope.reexaminationTime;
    //     var allDay = $scope.allDay;

    //     // Tạo thông điệp alert chứa thông tin đã nhập
    //     var message = "Tiêu đề cuộc hẹn: " + appoinmentTitle + "\n" +
    //         "Bệnh nhân: " + appoinmentPantient + "\n" +
    //         "Dịch vụ: " + appoinmentService + "\n" +
    //         "Bác sĩ: " + appoinmentDoctor + "\n" +
    //         "Ngày bắt đầu: " + appoinmentStartDate + " " + appoinmentStartTime + "\n" +
    //         "Ngày kết thúc: " + appoinmentEndDate + " " + appoinmentEndTime + "\n" +
    //         "All day: " + allDay;

    //     // Hiển thị thông báo alert
    //     alert(message);
    // };
    $scope.initializeFullCalendar = () => {
        /** full calendar */
        var events = [
            {
                title: "Kiểm tra răng",
                start: "2024-06-15T18:30:00",
                end: "2024-06-15T19:00:00",
                doctor: "Bs. Hoàn Đinh",
                patient: "Vĩ Khang",
                service: "Kiểm tra răng"
            },
            {
                title: "Trám răng",
                start: "2024-06-15T10:30:00",
                end: "2024-06-15T11:30:00",
                doctor: "Bs. Đức Anh",
                patient: "Bảo Trân",
                service: "Trám răng"
            },
            {
                title: "Lấy cao răng Lấy cao răng Lấy cao răng Lấy cao răng Lấy cao răng",
                start: "2024-06-16T14:00:00",
                end: "2024-06-16T15:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            },
            {
                title: "Nhổ răng",
                start: "2024-06-16T15:00:00",
                end: "2024-06-16T16:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            },
            {
                title: "Trám răng",
                start: "2024-06-16T16:00:00",
                end: "2024-06-16T17:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            },
            {
                title: "Lấy chỉ răng",
                start: "2024-06-16T17:00:00",
                end: "2024-06-16T18:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            },
            {
                title: "Trồng răng Trồng răng Trồng răng Trồng răng Trồng răng Trồng răng",
                start: "2024-06-16T18:00:00",
                end: "2024-06-16T19:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            }
        ];
        var calendarEl = document.getElementById('calendar-book-appointment');
        if (calendarEl) {
            var calendar = new FullCalendar.Calendar(calendarEl,
                {
                    plugins: ['dayGrid', 'timeGrid', 'list', 'bootstrap'],
                    timeZone: 'UTC',
                    themeSystem: 'bootstrap',
                    header:
                    {
                        left: 'today, prev, next',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                    },
                    buttonIcons:
                    {
                        prev: 'fe-arrow-left',
                        next: 'fe-arrow-right',
                        prevYear: 'left-double-arrow',
                        nextYear: 'right-double-arrow'
                    },
                    weekNumbers: true,
                    eventLimit: true, // allow "more" link when too many events
                    //events: 'https://fullcalendar.io/demo-events.json'
                    locale: 'vi', // Thiết lập ngôn ngữ tiếng Việt
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
                        hour12: false // Thiết lập định dạng 24 giờ
                    },
                    events: events,
                    eventClick: function (info) {
                        console.log("info", info);
                        var eventDetails =
                            '<strong>Tên bác sĩ:</strong> ' + info.event.extendedProps.doctor + '<br>' +
                            '<strong>Tên bệnh nhân:</strong> ' + info.event.extendedProps.patient + '<br>' +
                            '<strong>Dịch vụ:</strong> ' + info.event.extendedProps.service + '<br>' +
                            '<strong>Thời gian bắt đầu:</strong> ' + info.event.start.toLocaleString() + '<br>' +
                            '<strong>Thời gian kết thúc:</strong> ' + info.event.end.toLocaleString();
                        document.getElementById('eventDetailsBody').innerHTML = eventDetails;
                        const btnEventDetails = document.getElementById('btnEventDetails');
                        btnEventDetails.click();
                    }
                });
            calendar.render();
        }
    }

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
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
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            },
            // function (start, end, label) {
            //     alert('A new date selection was made: ' + start.format('DD/MM/YYYY'));
            // }
        );
        $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.getListDoctorSchedule(selectedDate)
            //alert(selectedDate)

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

        // $('#appoinmentDoctor').on('change', function () {
        //     $timeout(function () {
        //         $scope.formCalendar.doctorId = $('#appoinmentDoctor').val();
        //     });
        // });
    }

    $scope.initializeUppyUploader = () => {
        var uptarg = document.getElementById('drag-drop-area');
        if (uptarg) {
            var uppy = Uppy.Core().use(Uppy.Dashboard,
                {
                    inline: true,
                    target: uptarg,
                    proudlyDisplayPoweredByUppy: false,
                    theme: 'dark',
                    width: 770,
                    height: 210,
                    plugins: ['Webcam']
                }).use(Uppy.Tus,
                    {
                        endpoint: 'https://master.tus.io/files/'
                    });
            uppy.on('complete', (result) => {
                console.log('Upload complete! We’ve uploaded these files:', result.successful)
            });
        }
    }

    $scope.listServiceInfo = () => {
        $http.get(url + '/service').then(response => {
            $scope.listServiceFromDB = response.data
            console.log("$scope.listServiceFromDB", $scope.listServiceFromDB);
        }).catch(error => {
            console.log("error", error);
        })
    }
    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
            console.log("$scope.listDoctorDB", $scope.listDoctorDB);
        }).catch(err => {
            console.log("Error", err);
        })
    }


    $scope.getListDoctorSchedule = (date) => {
        var dateRequest = {
            date: moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")
        }
        console.log("dateRequest", dateRequest);
        $http.get(url + '/doctor-schedule-by-date', { params: dateRequest }).then(response => {
            console.log("response", response.data);
            // $scope.ShiftDB=response.data.filter(d => d.doctor).map(d => d.doctor);
            let doctorMap = new Map();
            response.data.forEach(d => {
                if (d.doctor) {
                    doctorMap.set(d.doctor.doctorId, d.doctor);
                }
            });

            // Chuyển Map thành mảng
            $scope.doctorDB = Array.from(doctorMap.values());
            $scope.shiftDB = (doctorId) => {
                var shift = response.data
                    .filter(item => item.doctor && item.doctor.doctorId === doctorId)
                    .map(item => item.shift);
                return shift
            }
        })
    }

    $scope.timeOfShiftDB = (ShiftId) => {
        return $http.get(url + '/time-of-shift-by-shift-id/' + ShiftId)
            .then(function (response) {
                return response.data; // Trả về dữ liệu từ server
            })
            .catch(function (error) {
                console.error('Error in getTimeOfShift for Shift ID ' + ShiftId + ':', error)
                throw error; // Ném lỗi nếu có lỗi xảy ra
            })
    }
  

    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status').then(respone => {
            $scope.listAppointmentStatusDB = respone.data
            console.log(" $scope.listAppointmentStatusDB", $scope.listDentalStaffDB);
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getListAppointmentType = () => {
        $http.get(url + '/appointment-type').then(respone => {
            $scope.listAppointmentTypeDB = respone.data
            console.log(" $scope.listDentalStaffDB", $scope.listAppointmentTypeDB);
        }).catch(err => {
            console.log("Error", err);
        })
    }


    $scope.setupTab()
    $scope.initializeFullCalendar();
    $scope.initializeUIComponents();
    $scope.initializeUppyUploader();
    $scope.listServiceInfo()
    $scope.getListDoctor()
    $scope.getListAppointmentStatus()
    $scope.getListAppointmentType()
})


// $scope.getTimeDataFromDB = function() {
//     $http.get('/api/time-data') // Đổi lại đường dẫn API của bạn
//         .then(function(response) {
//             $scope.timeData = response.data; // Lưu dữ liệu từ DB vào $scope.timeData
//             // Sau khi nhận được dữ liệu, gọi hàm để khởi tạo timepicker
//             $scope.initializeTimepicker();
//         })
//         .catch(function(error) {
//             console.error('Error fetching time data:', error);
//         });
// };

// // Hàm khởi tạo timepicker với dữ liệu từ DB
