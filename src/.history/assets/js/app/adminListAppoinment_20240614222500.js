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

    $scope.initializeFullCalendar = () => {
        var calendarEl = document.getElementById('calendarFourDays');

        var calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: ['resourceTimeline'],
            initialView: 'customFourDay',
            views: {
                customFourDay: {
                    type: 'resourceTimeline',
                    duration: { days: 4 },
                    buttonText: '4 day'
                }
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'customFourDay,resourceTimelineWeek,resourceTimelineMonth'
            },
            resources: [
                { id: 'a', title: 'Room A' },
                { id: 'b', title: 'Room B' }
            ],
            events: [
                { id: '1', resourceId: 'a', start: '2024-06-14T09:00:00', end: '2024-06-14T14:00:00', title: 'Meeting' },
                { id: '2', resourceId: 'b', start: '2024-06-15T12:00:00', end: '2024-06-15T18:00:00', title: 'Conference' }
            ]
        });

        calendar.render();
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
            console.log("$scope.listDoctorDB", $scope.listDoctorDB);
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
    $scope.initializeFullCalendar()
})