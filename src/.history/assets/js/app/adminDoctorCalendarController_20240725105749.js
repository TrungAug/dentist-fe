app.controller('AdminDoctorCalendarController', function ($scope, $http, $rootScope, $location, $timeout, $window, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    const defaultTimezone = "Asia/Ho_Chi_Minh"
    let doctorLogin = 1

    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status').then(resp => {
            $scope.listAppointmentStatusBD = resp.data
            $scope.formDoctor.appointmentStatus = $scope.listAppointmentStatusBD.find((item) => item.status.toLowerCase() === 'hoàn thành').appointment_StatusId
        })
    }

    $scope.processDoctorUnavailability = (doctorId) => {
        console.log("doctorId",doctorId);
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability').then(response => {
                let filtered = response.data.forEach(du=>{
                    console.log("du",du);
                })

                console.log("filtered 1", filtered)
                resolve(filtered) //fillter theo doctorId
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.getDoctorScheduleExceptDeleted = (doctorId) => {
        return new Promise((resolve, reject) => {
            // /doctor-schedule-and-tos
            $http.get(url + '/doctor-schedule-except-deleted').then(response => {
                let filtered = response.data.forEach(ds=>ds.doctor.doctorId===doctorId)
                console.log("filtered 2", filtered)
                resolve(filtered) // filter theo doctorId
            }).catch(err => reject(err))
        })
    }

    // $scope.processDSWithAppointmentStatus = (curentDate, doctorId) => {
    //     let params = {
    //         date: curentDate
    //     }
    //     return new Promise((resolve, reject) => {
    //         $http.get(url + '/doctor-schedule-with-appointment-status', { params: params }).then(response => {
    //             let filtered = response.data
    //             console.log("filtered 3", filtered)//filter lại theo doctorLogin
    //             resolve(response.data)
    //         }).catch(err =>
    //             reject(err)
    //         )
    //     })
    // }

    $scope.initializeDoctorCalendar = () => {
        let calendar;
        let resources = [];
        let eventArr = [];

        const loadResourcesAndEvents = (currentDate) => {
            // $scope.processDSWithAppointmentStatus(currentDate,doctorLogin).then(result => {
            //     resources = [];
            //     for (let key in result) {
            //         if (result.hasOwnProperty(key)) {
            //             let obj = {
            //                 id: key.split('-')[0],
            //                 title: key.split('-')[1],
            //             };
            //             resources.push(obj);
            //         }
            //     }
            //     resources.sort((a, b) => a.id - b.id);
            //     loadDoctorUnavailability()
            // })
            loadDoctorUnavailability()
        };

        const loadDoctorUnavailability = () => {
            eventArr = []

            $scope.processDoctorUnavailability(doctorLogin).then(dataDu => {
                let checkStatus = ['đã hủy', 'không đến', 'hoãn']
                dataDu = dataDu.filter(du => {
                    let stt = du.appointment.appointmentStatus
                    let isAuth = checkStatus.includes(stt ? du.appointment.appointmentStatus.status.toLowerCase() : 'đã xác nhận')
                    return (du.deleted == false) || (du.deleted == true && isAuth)
                })
                dataDu.forEach(du => {
                    let status = du.appointment.appointmentStatus;
                    let color = status ? $scope.getColorForStatusId(du.appointment.appointmentStatus.status) : 'rgba(92, 184, 92, 0.7)';
                    let event = {
                        id: du.appointment.appointmentId,
                        start: du.appointment.appointmentDate + "T" + du.timeOfShift.beginTime,
                        end: du.appointment.appointmentDate + "T" + du.timeOfShift.endTime,
                        resourceId: du.appointment.doctor.doctorId,
                        color: color,
                        doctor: du.appointment.doctor ? du.appointment.doctor : null,
                        appointment: du.appointment ? du.appointment : null,
                        tos: du.timeOfShift ? du.timeOfShift : null
                    };
                    eventArr.push(event);


                });
                // updateCalendar();
            });

            $scope.getDoctorScheduleExceptDeleted(doctorLogin).then(dataDs => {
                dataDs.forEach(ds => {
                    let event = {
                        id: "",
                        start: ds.date.split("T")[0] + "T" + ds.shift.beginTime,
                        end: ds.date.split("T")[0] + "T" + ds.shift.endTime,
                        resourceId: ds.doctor.doctorId,
                        color: "#c8e5e9",
                        clickCount: 0
                    }
                    eventArr.push(event);
                })
                // updateCalendar();
            })
        };

        // const updateCalendar = () => {
        //     calendar.getResources().forEach(resource => {
        //         calendar.getResourceById(resource.id).remove();
        //     });
        //     resources.forEach(resource => {
        //         calendar.addResource(resource);
        //     });

        //     calendar.getEvents().forEach(event => {
        //         event.remove();
        //     });
        //     eventArr.forEach(event => {
        //         calendar.addEvent(event);
        //     });
        // };

        const renderCalendar = () => {
            const calendarEl = document.getElementById('doctor-calendar-schedule');
            calendar = new FullCalendar2.Calendar(calendarEl, {
                initialView: 'timeGridDay',
                timeZone: 'Asia/Ho_Chi_Minh',
                themeSystem: 'bootstrap',
                dragScroll: true,
                locale: 'vi',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridDay'
                    // ,timeGridWeek,timeGridDay,dayGridMonth
                },
                editable: false,//không cho drag và resize events            
                slotDuration: '00:30:00',
                slotMinTime: '07:00:00',
                slotMaxTime: '22:00:00',
                slotLabelFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                },
                buttonText: {
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    list: 'Lịch sử'
                },
                events: eventArr,
                selectable: true,
                selectMirror: true,
                select: function (arg) {

                    let events = calendar.getEvents().filter(event => {
                        return (
                            event.start < arg.end && arg.start < event.end &&
                            event.getResources().some(resource => resource != null && resource.id === arg.resource.id)
                        )
                    });

                    if (events.length === 0) {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Bác sĩ không có lịch làm việc !",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        calendar.unselect();
                        return;
                    }

                    let hasAppointment = events.some(event => event.id !== "" && event.extendedProps.appointment.deleted == false)
                    if (hasAppointment) {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Đã có lịch hẹn!",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        calendar.unselect();
                        return
                    }

                    let now = new Date();
                    let startDate = new Date(arg.startStr);
                    startDate.setMinutes(now.getMinutes() + 15);
                    if (startDate < now ||
                        (startDate.getHours() === 7 && startDate.getMinutes() < 30 && startDate < now) ||
                        (startDate.getHours() > 21 && startDate < now)) {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Đã quá giờ đăng ký cuộc hẹn !",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        calendar.unselect();
                        return;
                    }

                    $scope.getTimeOfShiftByRangeTime(arg.startStr, arg.endStr);
                    $scope.formApp.doctorId = parseInt(arg.resource.id);
                    $scope.formApp.fullName = arg.resource.title;
                    $scope.formApp.appointmentDate = moment(arg.startStr.split("T")[0], "YYYY-MM-DD").format("DD/MM/YYYY")
                    $scope.validDateByPatient = moment(arg.startStr.split("T")[0], "YYYY-MM-DD").format("DD/MM/YYYY")
                    $scope.formApp.startTime = arg.startStr.split("T")[1]
                    $scope.formApp.endTime = arg.endStr.split("T")[1]
                    // $scope.startDate = arg.startStr.split("T")[0];
                    $scope.isSelectCalendar = true;
                    $scope.$apply();
                    const divRegisterAppointment = document.getElementById('div-register-appointment');
                    divRegisterAppointment.click();

                },
                eventClick: function (arg) {

                    if (arg.event.id === "") {
                        return
                    }
                    let originalApp = arg.event.extendedProps.appointment
                    if (originalApp == null) {
                        return
                    }

                    $scope.getOriginalData(parseInt(arg.event.id));
                    $scope.originalDate = moment(originalApp.appointmentDate, ('YYYY-MM-DD')).format('DD/MM/YYYY')
                    $scope.comparasionDateEvent(originalApp.appointmentDate)
                    // $scope.selectedTosOriginal = [arg.event.extendedProps.tos]
                    $scope.formUpApp = {
                        reExaminationDate: originalApp.appointmentPatientRecord.reExamination,
                        currentCondition: originalApp.appointmentPatientRecord.currentCodition,
                        appointmentDate: $scope.originalDate,
                        fullName: originalApp.doctor.fullName,
                        startTime: arg.event.extendedProps.tos.beginTime,
                        endTime: arg.event.extendedProps.tos.endTime,
                        patientId: originalApp.patient.patientId,
                        appointmentStatus: originalApp.appointmentStatus ? originalApp.appointmentStatus.appointment_StatusId : 2,
                        appointmentTypeId: originalApp.appointmentType.appointment_TypeId,
                        createDate: originalApp.createAt,
                        doctorId: originalApp.doctor.doctorId,
                        deleted: originalApp.deleted,
                        quantity: 1,
                        isReExamination: originalApp.appointmentPatientRecord.reExamination == "" ? false : true
                    }
                    $scope.validStatus = originalApp.appointmentStatus ? originalApp.appointmentStatus.status : ""
                    $scope.$apply();

                    const btnUpdateAppointment = document.getElementById('btnUpdateAppointment');
                    btnUpdateAppointment.click();
                },
                datesSet: function (info) {               
                    $scope.fullCalendarDate = info.view.currentStart;
                    loadResourcesAndEvents(info.view.currentStart);
                },

            });

            calendar.render();
            const allDaySpan = document.querySelector('.fc-timegrid-axis-cushion')
            allDaySpan.classList.add('custom-all-day');
        };

        $scope.getColorForStatusId = (status) => {
            switch (status.toLowerCase()) {
                case "đã xác nhận":
                    return 'rgba(92, 184, 92, 0.7)';
                case "đã đặt":
                    return 'rgba(158, 234, 16, 0.7)';
                case "đang diễn ra":
                    return 'rgba(0, 123, 255, 0.7)';
                case "đã hủy":
                    return 'rgba(217, 83, 79, 0.7)';
                case "không đến":
                    return 'rgba(240, 173, 78, 0.7)';
                case "hoãn":
                    return 'rgba(255, 193, 7, 0.7)';
                case "hoàn thành":
                    return 'rgb(26 6 244)';
                default:
                    return 'rgba(158, 234, 16, 0.7)';
            }
        };

        renderCalendar();
    };

    $scope.initializeDoctorCalendar()
});