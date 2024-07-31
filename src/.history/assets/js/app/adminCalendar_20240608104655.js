app.controller('AdminCalendar', function ($scope, $http, $rootScope, $location, $timeout) {
    let url = "http://localhost:8080/api/v1"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here

    $scope.initializeFullCalendar = function () {
        /** full calendar */
        var calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            document.addEventListener('DOMContentLoaded', function () {
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
                        events: 'https://fullcalendar.io/demo-events.json'
                    });
                calendar.render();
            });
        }
    }

    
    $scope.initializeFullCalendar();
})