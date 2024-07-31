app.controller('AdminListAppoinment', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.currentTab = -1;
    $scope.selectTab = (tab, $event) => {
        $event.preventDefault()
        $scope.currentTab = tab;
    }
    $scope.isSelected = (tab) => {
        return $scope.currentTab === tab;
    }
    $scope.initializeFullCalendar = (calendarId) => {
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
                title: "Trồng răng",
                start: "2024-06-16T18:00:00",
                end: "2024-06-16T19:00:00",
                doctor: "Bs. Hoàng Tuấn",
                patient: "Hồng Đào",
                service: "Lấy cao răng"
            }
        ];

        var calendarEl = document.getElementById(calendarId);
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
    $scope.initializeCalendars = () => {
        $timeout(() => {
            angular.forEach($scope.listDoctorDB, (doctor) => {
                var calendarId = 'doctor-' + doctor.doctorId;
                $scope.initializeFullCalendar(calendarId);
            });
        }, 0);
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
            console.log("$scope.listDoctorDB", $scope.listDoctorDB);
            $scope.initializeCalendars()
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
    // $timeout(function() {
    //     $('#dataTable-list-appoinment').DataTable({
    //         autoWidth: true,
    //         "lengthMenu": [
    //             [16, 32, 64, -1],
    //             [16, 32, 64, "All"]
    //         ]
    //     });
    // }, 0);


    $scope.getListDoctor()
    $scope.listAppoinmentInfo()

})