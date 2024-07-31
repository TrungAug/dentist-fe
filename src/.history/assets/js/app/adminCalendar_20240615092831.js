console.log("AdminCalendar");
app.controller('AdminCalendar', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8080/api/v1"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.listAppointment = () => {

    }
    $scope.saveAppoinment = () => {
        // Lấy ra các giá trị đã nhập từ các trường input
        var appoinmentTitle = $scope.appoinmentTitle;
        var appoinmentPantient = $scope.appoinmentPantient;
        var appoinmentService = $scope.appoinmentService;
        var appoinmentDoctor = $scope.appoinmentDoctor;
        var appoinmentStartDate = $scope.appointmentDate;
        var appoinmentStartTime = $scope.appointmentTime;
        var appoinmentEndDate = $scope.reexaminationDate;
        var appoinmentEndTime = $scope.reexaminationTime;
        var allDay = $scope.allDay;

        // Tạo thông điệp alert chứa thông tin đã nhập
        var message = "Tiêu đề cuộc hẹn: " + appoinmentTitle + "\n" +
            "Bệnh nhân: " + appoinmentPantient + "\n" +
            "Dịch vụ: " + appoinmentService + "\n" +
            "Bác sĩ: " + appoinmentDoctor + "\n" +
            "Ngày bắt đầu: " + appoinmentStartDate + " " + appoinmentStartTime + "\n" +
            "Ngày kết thúc: " + appoinmentEndDate + " " + appoinmentEndTime + "\n" +
            "All day: " + allDay;

        // Hiển thị thông báo alert
        alert(message);
    };
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
                title: "Lấy cao răng",
                start: "2024-06-16T14:00:00",
                end: "2024-06-16T15:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            }
        ];
        var calendarEl = document.getElementById('calendar');
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
                    slotLabelFormat: {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false // Thiết lập định dạng 24 giờ
                    },
                    events: events,
                    eventClick: function (info) {
                        alert('Tên bác sĩ: ' + info.event.extendedProps.doctor + '\n' +
                            'Tên bệnh nhân: ' + info.event.extendedProps.patient + '\n' +
                            'Dịch vụ: ' + info.event.extendedProps.service + '\n' +
                            'Thời gian bắt đầu: ' + info.event.start.toLocaleString() + '\n' +
                            'Thời gian kết thúc: ' + info.event.end.toLocaleString());
                    }
                });
            calendar.render();
        }
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
                    format: 'MM/DD/YYYY'
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
    $scope.initializeFullCalendar();
    $scope.initializeUIComponents();
    $scope.initializeUppyUploader();
})