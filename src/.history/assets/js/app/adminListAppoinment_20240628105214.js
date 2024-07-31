app.controller('AdminListAppoinment', function ($scope, $http, $rootScope, $location, $timeout,TimezoneService) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    var defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.selectedDoctors = []
    $scope.selectedDates = []

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

    $scope.setupSubtab = () => {
        $scope.currentSubTab = -1;
        $scope.selectSubTab = (tab, $event) => {
            $event.preventDefault()
            $scope.currentSubTab = tab;
        }
        $scope.isSelectedSubTab = (tab) => {
            return $scope.currentSubTab === tab;
        }
    }

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
                    start: `${item.date.split("T")[0]}T${item.timeOfShift.beginTime}`,
                    end: `${item.date.split("T")[0]}T${item.timeOfShift.endTime}`,
                    doctor: item.appointment.doctor ? item.appointment.doctor.fullName : null,
                    patient: item.appointment.patient ? item.appointment.patient.fullName : null,
                    phoneNumber: item.appointment.patient ? item.appointment.patient.phoneNumber : null
                };
            });
            console.log("result", result);
            console.log("events", events);
            var calendarEl = document.getElementById('calendar-doctor-appoinment');
            if (calendarEl) {
                var calendar = new FullCalendar.Calendar(calendarEl,
                    {
                        plugins: ['resourceTimelinePlugin ','resourceTimeGridPlugin','dayGrid','timeGrid', 'list', 'bootstrap'],
                        timeZone: 'Asia/Ho_Chi_Minh',
                        themeSystem: 'bootstrap',
                        header:
                        {
                            left: 'today, prev, next',
                            center: 'title',
                            right: 'timeGridDay,listMonth',
                        },
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

    $scope.listAppoinmentInfo = () => {
        $http.get(url + '/appointment').then(response => {
            $scope.listAppoinmentFromDB = response.data
            console.log("$scope.listAppoinmentFromDB", $scope.listAppoinmentFromDB);
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
                });
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.getDoctorFilter=(doctorId)=>{
       
        var index = $scope.selectedDoctors.indexOf(doctorId)
        if(index===-1){
            $scope.selectedDoctors.push(doctorId)
        }else{
            $scope.selectedDoctors.splice(index, 1)
        }
        //console.log("selectedDoctor",$scope.selectedDoctors);
        return $scope.selectedDoctors;
    }

    $scope.getDateFilter = (selectedDate) => {
        console.log("selectedDate",selectedDate);       
        var dates = selectedDate.split(' - ');
        var fromDate = moment(dates[0], 'DD/MM/YYYY');
        var toDate = moment(dates[1], 'DD/MM/YYYY');
     
        while (fromDate <= toDate) {
            var convertedDate = TimezoneService.convertToTimezone(moment(fromDate,"DD/MM/YYYY").toDate(), defaultTimezone)
           // $scope.selectedDates.push(fromDate.format('DD/MM/YYYY'));
            $scope.selectedDates.push(convertedDate);
            fromDate = fromDate.add(1, 'days');
        }
        console.log("$scope.selectedDates",$scope.selectedDates);
        return $scope.selectedDates;
    }
    

    $scope.getListDoctorUnavailabilityAllDoctor=() => {
        $scope.processDoctorUnavailabilityAllDoctor().then(result =>{
            $scope.listDoctorUnavailabilityAllDoctorDB=result
            console.log("$scope.listDoctorUnavailabilityAllDoctor",$scope.listDoctorUnavailabilityAllDoctorDB);
        })
    }

    $scope.processDoctorUnavailabilityAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability').then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    

    $scope.setupTab()
    $scope.setupSubtab()
    $scope.getListDoctor()
    $scope.getListDoctorUnavailabilityAllDoctor()
    $scope.listAppoinmentInfo()
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