app.controller('AdminDoctorScheduleController', function ($scope, $http, $rootScope, $location, $timeout,$window) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    var selecteShiftdValues = ""
    $scope.listDoctorScheduleDB = ""
    var registeredDates=""

    $scope.getListShift = () => {
        $http.get(url + "/shift").then(respone => {
            $scope.listShiftDB = respone.data
            console.log("$scope.listShiftDB", $scope.listShiftDB);
        }).catch(err => {
            console.log("error", err);
        })
    }

    $scope.initializeFullCalendar = () => {
        /** full calendar */
        // event thay bằng lịch bác sĩ khám bệnh
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
        var calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            var calendar = new FullCalendar.Calendar(calendarEl,
                {
                    plugins: ['timeGrid', 'list', 'bootstrap'],
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
                }
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
                selecteShiftdValues = $('#formDoctorScheduleShiftId').val()
                $scope.processSelect2Data(selecteShiftdValues)
            });
        });
        $scope.processSelect2Data = function (values) {
            // Chia tách các giá trị thành mảng
            var processedValues = values.map(function (value) {
                // Loại bỏ các ký tự không phải là số và chuyển đổi thành số
                var numericValue = parseInt(value.replace(/\D/g, ''), 10);
                return isNaN(numericValue) ? null : numericValue;
            }).filter(function (value) {
                return value !== null;
            });
            selecteShiftdValues = processedValues;
        };
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

    $scope.getDateRegisetered= () => {
        //truyền id doctor khi login vào
        $scope.processDataDateRegistered(2).then(result => {
            registeredDates = result;          
        }).catch(error => {
            console.error('Error getting registered dates:', error);
        })
    }
 
    $scope.crudDoctorSchedule = () => {
        $scope.formDoctorSchedule = {
            date: moment().add(1, 'days').format('DD/MM/YYYY'),
            shiftId: '',
            doctorId:'',
            isAvailable: true,
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
        $scope.getDateArray = (selectedDate) => {
            var dates = selectedDate.split(' - ');
            var fromDate = moment(dates[0], 'DD/MM/YYYY');
            var toDate = moment(dates[1], 'DD/MM/YYYY');
            var dateArray = [];
            while (fromDate <= toDate) {
                dateArray.push(fromDate.format('DD/MM/YYYY'));
                fromDate = fromDate.add(1, 'days');
            }
            return dateArray;
        }
        $scope.generateScheduleArray = (doctorId, dates, shiftIds) => {
            //var date =dates.split(',')
            // var shiftId = shiftIds.split(',')
            var scheduleArray = []
            dates.forEach(date => {
                shiftIds.forEach(shiftId => {
                    var scheduleObject = {
                        doctorId: doctorId,
                        date: moment(date, 'DD/MM/YYYY').toDate(),
                        shiftId: shiftId,
                        isAvailable: true,
                        createAt: new Date(),
                        updateAt: ''
                    }
                    scheduleArray.push(scheduleObject);
                })
            })
            return scheduleArray
        }
        $scope.resetForm = () => {
            $scope.formDoctorSchedule = {
                date: moment().add(1, 'days').format('DD/MM/YYYY'),
                shiftId: '',
                doctorId:'',
                isAvailable: true,
                createAt: new Date(),
                updateAt: ''
            }
        }
        $scope.createDoctorSchedule = () => {
            var validForm = $scope.validationForm()
            if (validForm) {
                var selectedDate = $('#dateOfDoctorSchedule').val();
                var dates=$scope.getDateArray(selectedDate)
                var shiftIds = selecteShiftdValues;
                var doctorId=2 // lấy id bác sĩ khi đăng nhập
                var dataArray=$scope.generateScheduleArray(doctorId,dates,shiftIds)
                //console.log("dataArray",dataArray);
                dataArray.forEach(data => {
                    var requsetDataJSON = angular.toJson(data)
                    console.log("requsetDataJSON",requsetDataJSON);
                    console.log("data",data);
                    $http.post(url+'/doctor-schedule',data).then(response=>{
                        console.log("response",response);
                        Swal.fire({
                            title: "Thành công!",
                            html: "Đã đăng ký lịch làm việc cho ngày "+selectedDate,
                            icon: "success"
                        }).then(() => {
                            $window.location.reload(); // hoặc sử dụng $route.reload()
                        });
                        $scope.getDateRegisetered()
                        $scope.resetForm()
                    }).catch(error=>{
                        Swal.fire({
                            title: "Thất bại!",
                            html: '<p class="text-danger">Xảy ra lỗi khi đăng ký lịch làm việc!</p>',
                            icon: "error"
                        })
                        console.log("error",error);
                    })
                });
            }

        }
    }

    $scope.getListShift()
    $scope.initializeFullCalendar()
    $scope.initializeUIComponents()
    $scope.crudDoctorSchedule()

})