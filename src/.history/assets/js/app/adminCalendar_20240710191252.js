console.log("AdminCalendar");
app.controller('AdminCalendar', function ($scope, $http, $rootScope, $location, $timeout, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),

    }
    //code here
    var defaultTimezone = "Asia/Ho_Chi_Minh"
    var dentalStaff = 1
    $scope.listServiceByDentalIssuesDB = []
    $scope.listDoctorDB = []
    $scope.listTimeOfShiftByRangeTimeDB = []
    $scope.selectedServices = []
    $scope.selectedTimeOfShift = []
    $scope.listTOS = []
    $scope.listTOSFilter = []
    $scope.showFormRegister = false
    $scope.disableContinue = false

    $scope.formApp = {
        appointmentDate: moment(new Date).format('DD/MM/YYYY'),
        doctorId: -1,
        title: '',
        appointmentTypeId: -1,
        patientId: -1,
        dentalIssuesId: -1,
        notes: ''
    }

    $scope.initDataRequest = () => {
        $scope.appointmentPatientRecordRequest = {
            patientId: $scope.formApp.patientId,
            createAt: TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            currentCondition: "",
            reExamination: "",
            isDeleted: false
        }

        $scope.appointmentRequest = {
            patientId: $scope.formApp.patientId,
            appointmentPatientRecord: -1, //respone
            appointmentType: $scope.formApp.appointmentTypeId,
            doctorId: $scope.formApp.doctorId,
            dentalStaffId: dentalStaff,
            appointmentStatus: $scope.formApp.appointmentStatus,
            appointmentDate: TimezoneService.convertToTimezone(moment($scope.formApp.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
            note: $scope.formApp.notes,
            createAt: TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            isDeleted: false
        }

        // $scope.doctorUnavailabilityRequest = {
        //     description: "",
        //     timeOfShiftId: -1,
        //     appointmentId: -1,//respone
        //     date: TimezoneService.convertToTimezone(moment($scope.formApp.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
        //     isDeleted: false
        // }

        // $scope.appointmentServiceRequest = {
        //     appointmentId: -1, //respone
        //     serviceId: -1,// lấy từ mảng $scope.selectedServices
        //     quantity: 1,
        //     price: 0// lấy từ mảng $scope.selectedServices
        // }
    }



    $scope.isShowService = () => {
        return $scope.listServiceByDentalIssuesDB.length > 0
    }

    $scope.isContinueShow = () => {
        return $scope.selectedServices.length > 0
    }

    $scope.isShowFormRegister = ($event) => {
        $event.preventDefault()
        $scope.showFormRegister = true
    }

    $scope.updateSelectedServices = (service) => {
        if (service.checked) {
            $scope.selectedServices.push(service);
        } else {
            const index = $scope.selectedServices.findIndex(s => s.serviceId === service.serviceId);
            if (index !== -1) {
                $scope.selectedServices.splice(index, 1)
            }
        }
    }

    $scope.toggleAll = () => {
        const selectAll = document.getElementById('selectAll').checked;
        $scope.selectedServices = []
        $scope.listServiceByDentalIssuesDB.forEach(service => {
            service.checked = selectAll
            if (selectAll) {
                $scope.selectedServices.push(service)
            }
        })
        console.log("$scope.selectedServices ", $scope.selectedServices)
    }

    $scope.toggleCheckbox = function ($event, service) {
        $event.stopPropagation();
        service.checked = !service.checked;
        $scope.updateSelectedServices(service);
    }

    $scope.getTotalPrice = () => {
        return $scope.selectedServices.reduce((total, service) => total + service.price, 0)
    }

    $scope.getTotalTime = () => {
        return $scope.selectedServices.reduce((total, service) => total + service.timeEstimate, 0)
    }

    $scope.recommendShifts = (getTotalTime) => {
        $scope.disableContinue = false
        if (getTotalTime <= 40) {
            return 1;
        } else if (getTotalTime <= 70) {
            return 2;
        } else if (getTotalTime <= 100) {
            return 3;
        } else {
            $scope.disableContinue = true
            return 0;
        }
    }

    $scope.getRecommendation = () => {
        const totalTime = $scope.getTotalTime()
        const recommendation = $scope.recommendShifts(totalTime)
        return recommendation
    };

    $scope.getAllDentalIssuesExceptDeleted = () => {
        $http.get(url + '/dental-issues-except-deleted').then(response => {
            $scope.listDentalIssueDB = response.data
        })
    }

    $scope.getServiceByDentalIssues = (dentalIssuesIds) => {
        var ids = dentalIssuesIds.join(',')
        var params = {
            ids: ids
        }
        $http.get(url + '/service-by-dental-issues', { params: params }).then(response => {
            $scope.listServiceByDentalIssuesDB = response.data
        })
    }

    $scope.getListAppointmentType = () => {
        $http.get(url + '/appointment-type').then(respone => {
            $scope.listAppointmentTypeDB = respone.data
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getListPatient = () => {
        $http.get(url + '/patient').then(response => {
            $scope.listPatientDB = response.data
        })
    }

    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status').then(resp => {
            $scope.listAppointmentStatusBD = resp.data
            $scope.formApp.appointmentStatus = $scope.listAppointmentStatusBD.find((item) => item.status.toLowerCase() === 'đã xác nhận').appointment_StatusId
        })
    }

    $scope.getListDoctorSchedule = (date) => {
        var dateRequest = {
            date: moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")
        }
        $http.get(url + '/doctor-schedule-by-date', { params: dateRequest }).then(response => {
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

    $scope.getTimeOfShiftAvailable = (shiftId, dateSelected, doctorId) => {
        var convertedDate = TimezoneService.convertToTimezone(dateSelected, defaultTimezone)
        var params = {
            shiftId: shiftId,
            date: convertedDate,
            doctorId: doctorId
        }
        return $http.get(url + '/time-of-shift-available', { params: params }).then(response => {
            return response.data
        }).catch(error => {
            console.log("Error: " + error)
            throw error
        })
    }

    $scope.getAllTimeOfShiftDetails = (shiftId, dateSelected, doctorId) => {
        var convertedDate = TimezoneService.convertToTimezone(dateSelected, defaultTimezone)
        var params = {
            shiftId: shiftId,
            date: convertedDate,
            doctorId: doctorId
        }
        return $http.get(url + '/time-of-shift-details', { params: params }).then(response => {
            return response.data
        }).catch(error => {
            console.log("Error: " + error)
            throw error
        })
    }

    $scope.comparasionDate = (selectDate) => {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);

        return selectDate.getTime() === date.getTime();
    }

    $scope.getCurrentTimeInSeconds = () => {
        var now = new Date();
        return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    }

    $scope.timeStringToSeconds = (timeString) => {
        var [hours, minutes, seconds] = timeString.split(':').map(Number);
        return hours * 3600 + minutes * 60 + (seconds || 0);
    }

    $scope.isShiftAvailable = (timeOfShiftId) => {
        var checkData = $scope.listTOSFilter.filter(tos => tos[1].timeOfShiftId === timeOfShiftId)
        return checkData.length > 0 // trống lịch
    }

    $scope.isTimeLess = (tos) => {
        var timeLess = true
        var dateSelected = moment($scope.formApp.appointmentDate, "DD/MM/YYYY").toDate()
        if ($scope.comparasionDate(dateSelected)) {
            var currentTimeInSeconds = $scope.getCurrentTimeInSeconds()
            var beginTimeInSeconds = $scope.timeStringToSeconds(tos.beginTime) + 600
            if (beginTimeInSeconds > currentTimeInSeconds) {
                timeLess = false
            }
        } else {
            timeLess = false
        }
        return timeLess
    }

    $scope.setupTab = () => {
        $scope.currentTab = { shiftId: -1, doctorId: -1 }

        $scope.selectTab = (shiftId, doctorId, $event) => {
            var dateSelected = moment($scope.formApp.appointmentDate, "DD/MM/YYYY").toDate();

            $scope.formApp.doctorId = doctorId
            $event.preventDefault();
            $scope.currentTab = { shiftId: shiftId, doctorId: doctorId }

            $scope.getAllTimeOfShiftDetails(shiftId, dateSelected, doctorId).then(result => {
                $scope.listTOS = result
            })

            $scope.getTimeOfShiftAvailable(shiftId, dateSelected, doctorId).then(data => {
                $scope.listTOSFilter = data
            })
        }

        $scope.isSelected = (shiftId, doctorId) => {
            return $scope.currentTab.shiftId === shiftId && $scope.currentTab.doctorId === doctorId;
        }
    }

    $scope.onChangeTimeOfShift = (tos) => {
        if (tos.checked) {
            $scope.selectedTimeOfShift.push(tos);
        } else {
            const index = $scope.selectedTimeOfShift.indexOf(tos.timeOfShiftId);
            if (index !== -1) {
                $scope.selectedTimeOfShift.splice(index, 1);
            }
        }
    }

    $scope.generateAppointmentServiceRequest = (selectedServices, appointmentIdResponse) => {
        var dataArray = []
        selectedServices.forEach(s => {
            var appointmentServiceRequest = {
                appointmentId: appointmentIdResponse, //respone
                serviceId: s.serviceId,// lấy từ mảng $scope.selectedServices
                quantity: 1,
                price: s.price// lấy từ mảng $scope.selectedServices
            }
            dataArray.push(appointmentServiceRequest)
        })
        return dataArray
    }

    $scope.generateDoctorUnavailabilityRequest = (selectedTimeOfShift, appointmentIdResponse) => {
        var dataArray = []
        selectedTimeOfShift.forEach(tos => {
            var doctorUnavailabilityRequest = {
                description: "",
                timeOfShiftId: tos.timeOfShiftId,
                appointmentId: appointmentIdResponse,//respone
                date: TimezoneService.convertToTimezone(moment($scope.formApp.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
                isDeleted: false
            }
            dataArray.push(doctorUnavailabilityRequest)
        })
        return dataArray;
    }

    $scope.validationForm = () => {
        var patientId = $scope.formApp.patientId
        var doctorId = $scope.formApp.doctorId
        var tosArr = $scope.selectedTimeOfShift
        var serviceArr = $scope.selectedServices
        var title = $scope.formApp.title
        var appType = $scope.formApp.appointmentTypeId
        var valid = true

        if (title == "" || title == null) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng điền tiêu đề cuộc hẹn!",
                icon: "error"
            })
            valid = false
        } else if (doctorId == -1) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn bác sĩ khám!",
                icon: "error"
            })
            valid = false
        } else if (tosArr.length == 0) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn thời gian khám!",
                icon: "error"
            })
            valid = false
        } else if (appType == -1) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn loại cuộc hẹn!",
                icon: "error"
            })
            valid = false
        } else if (patientId == -1) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn bệnh nhân!",
                icon: "error"
            })
            valid = false
        }
        return valid
    }

    $scope.saveAppointment = async () => {
        $scope.initDataRequest()
        var valid = $scope.validationForm()
        if (valid) {
            try {
                var dataAPRReq = angular.toJson($scope.appointmentPatientRecordRequest)

                var responseApr = await $http.post(url + '/appointment-patient-record', dataAPRReq)
                $scope.appointmentRequest.appointmentPatientRecord = responseApr.data.appointmentPatientRecordId

                var dataAppoinmentReq = angular.toJson($scope.appointmentRequest)
                var respApp = await $http.post(url + '/appointment', dataAppoinmentReq)

                var appointmentId = respApp.data.appointmentId == null ? null : respApp.data.appointmentId

                var dataArrayDUReq = $scope.generateDoctorUnavailabilityRequest($scope.selectedTimeOfShift, appointmentId)
                var dataArrayServiceReq = $scope.generateAppointmentServiceRequest($scope.selectedServices, appointmentId)

                var doctorUnavailabilityRequests = dataArrayDUReq.map(item => {
                    var dataArrayDUReqJson = angular.toJson(item);
                    return $http.post(url + '/doctorUnavailability', dataArrayDUReqJson);
                })

                var appointmentServiceRequests = dataArrayServiceReq.map(item => {
                    var dataArrayServiceReqJson = angular.toJson(item);
                    return $http.post(url + '/appointment-service', dataArrayServiceReqJson);
                })

                await Promise.all([...doctorUnavailabilityRequests, ...appointmentServiceRequests])

                Swal.fire({
                    title: "Thành công!",
                    html: "Đặt lịch hẹn thành công",
                    icon: "success"
                }).then(() => {
                    $route.reload()
                })

            } catch (error) {
                console.error('Error saving appointment:', error);
                Swal.fire({
                    title: "Lỗi!",
                    html: "Có lỗi xảy ra khi đặt lịch hẹn. Vui lòng thử lại.",
                    icon: "error"
                });
            }
        }
    }

    $scope.processDoctorsWithAppointmentStatus = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-with-appointment-status').then(response => {
                resolve(response.data)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.processDoctorUnavailability = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability').then(response => {
                resolve(response.data)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.getTimeOfShiftByRangeTime = (startStr, endStr) => {
        startStr = startStr.split("T")[1]
        endStr = endStr.split("T")[1]
        console.log("startStr", startStr);
        var params = {
            startStr: startStr,
            endStr: endStr
        }
        $http.get(url + '/time-of-shift-by-range', { params: params }).then(response => {
            response.data.forEach(tos => {
                $scope.selectedTimeOfShift.push(tos.timeOfShiftId)
            })
        })
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
                minDate: moment().format('DD/MM/YYYY'),
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });
        $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.getListDoctorSchedule(selectedDate)
            $scope.formApp.appointmentDate = selectedDate
        });
        $('#dental-issues').on('change', function () {
            $timeout(function () {
                var selectedVals = $('#dental-issues').val()
                selecteDentalIssues = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getServiceByDentalIssues(selecteDentalIssues)
                var getDentalIssueNames = $scope.listDentalIssueDB
                    .filter(di => selecteDentalIssues.includes(di.dentalIssuesId))
                    .map(di => di.name)
                $scope.formApp.notes = getDentalIssueNames.join(' ,')
            });
        });

        $scope.formApp.appointmentDate = $('#appointmentDateRequest').val()

        $('#appointmentPatient').on('change', function () {
            $timeout(function () {
                var selectedVal = $('#appointmentPatient').val();
                $scope.formApp.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });

        $('#appointmentType').on('change', function () {
            $timeout(function () {
                var selectedVal = $('#appointmentType').val()
                $scope.formApp.appointmentTypeId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
    }

    $scope.initializeCalendarAppointment = () => {

        $scope.processDoctorsWithAppointmentStatus().then(result => {
            var resources = []
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    var childArr = []
                    result[key].forEach(at => {
                        var child = {
                            id: key.split('-')[0] + "-" + at.appointment_StatusId,
                            title: at.status,
                        }
                        childArr.push(child)
                    })

                    var obj = {
                        id: key.split('-')[0],
                        title: key.split('-')[1],
                        // children: childArr
                    }
                    resources.push(obj)
                }
            }
            resources.sort((a, b) => a.id - b.id);
            $scope.processDoctorUnavailability().then(dataDu => {
                var eventArr = []
                dataDu.forEach(du => {
                    var color = $scope.getColorForStatusId(du.appointment.appointmentStatus.status)
                    var event = {
                        id: du.appointment.appointmentId,
                        // title: du.appointment.patient.fullName,
                        start: du.appointment.appointmentDate + "T" + du.timeOfShift.beginTime,
                        end: du.appointment.appointmentDate + "T" + du.timeOfShift.endTime,
                        // resourceId: du.appointment.doctor.doctorId + "-" + du.appointment.appointmentStatus.appointment_StatusId,
                        resourceId: du.appointment.doctor.doctorId,
                        color: color
                    }
                    eventArr.push(event)
                })
                var calendarEl = document.getElementById('calendar-book-appointment')
                var calendar = new FullCalendar.Calendar(calendarEl, {
                    plugins: ['interaction', 'resourceTimeline'],
                    defaultView: 'resourceTimelineDay',
                    timeZone: 'Asia/Ho_Chi_Minh',
                    themeSystem: 'bootstrap',
                    dragScroll: true,
                    locale: 'vi',
                    aspectRatio: 3,
                    header: {
                        left: 'prev,next',
                        center: 'title',
                        //right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
                        right: 'resourceTimelineDay'
                    },
                    editable: true,
                    slotMinTime: '07:00:00',
                    slotMaxTime: '21:00:00',
                    slotDuration: '00:30:00',
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
                    resourceLabelText: 'Bác sĩ',
                    events: eventArr,
                    resources: resources,
                    selectable: true,
                    selectMirror: true,
                    select: function (arg) {
                        var now = new Date()
                        now.setMinutes(now.getMinutes() - 10)
                        var startDate = new Date(arg.startStr)

                        if (startDate < now || startDate.getHours() < 7 || startDate.getHours() > 21) {
                            Swal.fire({
                                position: "top-end",
                                icon: "warning",
                                title: "Đã quá giờ đăng ký cuộc hẹn !",
                                showConfirmButton: false,
                                timer: 1500
                            });
                            calendar.unselect()
                            return
                        } else {
                            console.log("arg", arg);
                            $scope.getTimeOfShiftByRangeTime(arg.startStr, arg.endStr)
                            console.log("timeOfShiftId bb", $scope.selectedTimeOfShift)
                            $scope.formApp.doctorId=arg.resource.id
                            $scope.formApp.appointmentDate=moment(arg.startStr.split("T")[0],"YYYY-MM-DD").format("DD/MM/YYYY")

                            console.log("$scope.formApp",$scope.formApp);
                        }
                    },
                    eventClick: function (arg) {
                        console.log("Arg event clicked", arg);

                    },
                    datesRender: function (info) {
                        var now = new Date();
                        now.setMinutes(now.getMinutes() - 10)
                        var tdElements = calendarEl.querySelectorAll('td.fc-widget-content.fc-minor, td.fc-widget-content.fc-major')
                        tdElements.forEach(td => {
                            var tdDate = new Date(td.getAttribute('data-date'));
                            //var isRemove = tdDate.getHours() < 7 || tdDate.getHours() > 21
                            // var thElements = calendarEl.querySelectorAll('th.fc-widget-header')
                            // var filteredThElements = [];
                            // thElements.forEach(th => {
                            //     var thDate = new Date(th.getAttribute('data-date'));
                            //     var hours = thDate.getHours();
                            //     if (hours < 7 || hours > 21) {
                            //         filteredThElements.push(th);
                            //     }
                            // })
                            // if(isRemove) {
                            //     filteredThElements.forEach(th=>{
                            //         th.remove()                                   
                            //     })
                            //     td.remove()
                            // }

                            var isPast = tdDate < now || tdDate.getHours() < 7 || tdDate.getHours() > 21
                            if (isPast) {
                                td.classList.add('fc-custom-past')
                            }
                        });
                    },
                });

                calendar.render();
                var licenseMessage = document.querySelector('.fc-license-message');
                if (licenseMessage) {
                    licenseMessage.parentNode.removeChild(licenseMessage);
                }
            })
        })

        $scope.getColorForStatusId = (status) => {
            switch (status.toLowerCase()) {
                case "đã xác nhận":
                    return 'rgba(92, 184, 92, 0.7)'
                case "đã đặt":
                    return 'rgba(169, 169, 169, 0.7)'
                case "đang diễn ra":
                    return 'rgba(0, 123, 255, 0.7)'
                case "đã hủy":
                    return 'rgba(217, 83, 79, 0.7)'
                case "không đến":
                    return 'rgba(240, 173, 78, 0.7)'
                case "hoãn":
                    return 'rgba(255, 193, 7, 0.7)'
                case "hoàn thành":
                    return 'rgba(0, 166, 90, 0.7)'
                default:
                    return 'rgba(169, 169, 169, 0.7)'
            }
        }
    }


    $scope.getAllDentalIssuesExceptDeleted()
    $scope.initializeCalendarAppointment()
    $scope.initializeUIComponents()
    $scope.setupTab()
    $scope.getListAppointmentType()
    $scope.getListAppointmentStatus()
    $scope.getListPatient()

    // $scope.listTOS = []
    // var dentalStaff = 1  
    // $scope.isContinueShow=false
    // $scope.isShowFormRegister=false

    // $scope.setupTab = () => {
    //     $scope.currentTab = { shiftId: -1, doctorId: -1 };
    //     $scope.selectTab = (shiftId, doctorId, $event) => {
    //         var dateSelected = moment($scope.formAppointmentRequest.appointmentDate, "DD/MM/YYYY").toDate();
    //         //console.log("dateSelected", dateSelected);

    //         $scope.formAppointmentRequest.doctorId = doctorId
    //         $event.preventDefault();
    //         $scope.currentTab = { shiftId: shiftId, doctorId: doctorId };
    //         $scope.timeOfShiftDB(shiftId, dateSelected, doctorId)
    //             .then(function (data) {
    //                 if ($scope.comparasionDate(dateSelected)) {
    //                     var currentTimeInSeconds = $scope.getCurrentTimeInSeconds()
    //                     console.log('now is ' +currentTimeInSeconds)
    //                     $scope.listTOS = data.filter((tos) => {
    //                         var beginTimeInSeconds = $scope.timeStringToSeconds(tos[1].beginTime)+600
    //                         console.log('selected is ' +tos[1].beginTime)
    //                         return beginTimeInSeconds > currentTimeInSeconds
    //                     })
    //                     console.log("$scope.listTOS koooo", $scope.listTOS)
    //                 } else {
    //                     $scope.listTOS = data
    //                     console.log("$scope.listTOS okkkk", $scope.listTOS)
    //                 }
    //             })
    //             .catch(function (error) {
    //                 console.error('Có lỗi khi lấy dữ liệu theo shiftId ' + shiftId + ' và doctorId ' + doctorId + ':', error);
    //             });
    //     };
    //     $scope.isSelected = (shiftId, doctorId) => {
    //         return $scope.currentTab.shiftId === shiftId && $scope.currentTab.doctorId === doctorId;
    //     };
    // }

    // $scope.initializeFullCalendar = () => {
    //     $scope.extractTimeFromISOString = (isoString) => {
    //         var timePart = isoString.split('T')[1];
    //         return timePart.slice(0, 5);
    //     }
    //     $scope.processDoctorUnavailabilityAllDoctor().then(result => {
    //         result=result.filter(rs=>rs.deleted===false)
    //         var events = result.map(item => {
    //             return {
    //                 title: item.appointment.patient ? item.appointment.patient.fullName : null,
    //                 date: item.date,
    //                 start: item.date?`${item.date.split("T")[0]}T${item.timeOfShift.beginTime}`:null,
    //                 end: item.date?`${item.date.split("T")[0]}T${item.timeOfShift.endTime}`:null,
    //                 doctor: item.appointment.doctor ? item.appointment.doctor.fullName : null,
    //                 patient: item.appointment.patient ? item.appointment.patient.fullName : null,
    //                 phoneNumber: item.appointment.patient ? item.appointment.patient.phoneNumber : null
    //             };
    //         });
    //         console.log("result", result);
    //         console.log("events", events);
    //         var calendarEl = document.getElementById('calendar-book-appointment');
    //         if (calendarEl) {
    //             var calendar = new FullCalendar.Calendar(calendarEl,
    //                 {
    //                     plugins: ['dayGrid', 'timeGrid', 'list', 'bootstrap'],
    //                     timeZone: 'Asia/Ho_Chi_Minh',
    //                     themeSystem: 'bootstrap',
    //                     header:
    //                     {
    //                         left: 'today, prev, next',
    //                         center: 'title',
    //                         right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    //                     },
    //                     buttonIcons:
    //                     {
    //                         prev: 'fe-arrow-left',
    //                         next: 'fe-arrow-right',
    //                         prevYear: 'left-double-arrow',
    //                         nextYear: 'right-double-arrow'
    //                     },
    //                     weekNumbers: true,
    //                     eventLimit: true,
    //                     locale: 'vi',
    //                     buttonText: {
    //                         today: 'Hôm nay',
    //                         month: 'Tháng',
    //                         week: 'Tuần',
    //                         day: 'Ngày',
    //                         list: 'Lịch sử'
    //                     },
    //                     slotLabelFormat: {
    //                         hour: '2-digit',
    //                         minute: '2-digit',
    //                         hour12: false
    //                     },
    //                     slotMinTime: '06:00:00',
    //                     slotMaxTime: '21:00:00',
    //                     events: events,
    //                     eventClick: function (info) {
    //                         console.log("info", info);
    //                         var timeStart = $scope.extractTimeFromISOString(info.event.start.toISOString())
    //                         var timeEnd = info.event.end ? $scope.extractTimeFromISOString(info.event.end.toISOString()) : 'N/A';
    //                         var eventDetails =
    //                             '<strong>Tên bác sĩ:</strong> ' + info.event.extendedProps.doctor + '<br>' +
    //                             '<strong>Bệnh nhân:</strong> ' + info.event.extendedProps.patient + ' - ' + info.event.extendedProps.phoneNumber
    //                             + '<br>' +
    //                             '<strong>Thời gian bắt đầu:</strong> ' + timeStart + '<br>' +
    //                             '<strong>Thời gian kết thúc:</strong> ' + timeEnd;
    //                         document.getElementById('eventDetailsBody').innerHTML = eventDetails;
    //                         const btnEventDetails = document.getElementById('btnEventDetails');
    //                         btnEventDetails.click();
    //                     }
    //                 });
    //             calendar.render();
    //         }
    //     });

    // }

    // $scope.initializeUIComponents = () => {
    //     $('.select2').select2(
    //         {
    //             theme: 'bootstrap4',
    //             placeholder: 'Select an option',
    //             allowClear: true
    //         });
    //     $('.select2-multi').select2(
    //         {
    //             multiple: true,
    //             theme: 'bootstrap4',
    //         });
    //     $('.drgpicker').daterangepicker(
    //         {
    //             singleDatePicker: true,
    //             timePicker: false,
    //             showDropdowns: true,
    //             minDate: moment().format('DD/MM/YYYY'),
    //             locale:
    //             {
    //                 format: 'DD/MM/YYYY',
    //                 applyLabel: 'Áp dụng',
    //                 cancelLabel: 'Hủy',
    //             },
    //         },
    //         // function (start, end, label) {
    //         //     alert('A new date selection was made: ' + start.format('DD/MM/YYYY'));
    //         // }
    //     );
    //     $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
    //         var selectedDate = picker.startDate.format('DD/MM/YYYY');
    //         $scope.getListDoctorSchedule(selectedDate)
    //         // $scope.formAppointmentRequest.appointmentDate = picker.startDate.toDate()
    //         $scope.formAppointmentRequest.appointmentDate = selectedDate
    //     });
    //     $('.time-input').timepicker(
    //         {
    //             'scrollDefault': 'now',
    //             'zindex': '9999' /* fix modal open */
    //         });
    //     /** date range picker */
    //     if ($('.datetimes').length) {
    //         $('.datetimes').daterangepicker(
    //             {
    //                 timePicker: true,
    //                 startDate: moment().startOf('hour'),
    //                 endDate: moment().startOf('hour').add(32, 'hour'),
    //                 locale:
    //                 {
    //                     format: 'M/DD hh:mm A'
    //                 }
    //             });
    //     }
    //     var start = moment().subtract(29, 'days');
    //     var end = moment();

    //     function cb(start, end) {
    //         $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    //     }
    //     $('#reportrange').daterangepicker(
    //         {
    //             startDate: start,
    //             endDate: end,
    //             ranges:
    //             {
    //                 'Today': [moment(), moment()],
    //                 'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    //                 'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    //                 'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    //                 'This Month': [moment().startOf('month'), moment().endOf('month')],
    //                 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    //             }
    //         }, cb);
    //     cb(start, end);
    //     $('.input-placeholder').mask("00/00/0000",
    //         {
    //             placeholder: "__/__/____"
    //         });
    //     $('.input-zip').mask('00000-000',
    //         {
    //             placeholder: "____-___"
    //         });
    //     $('.input-money').mask("#.##0,00",
    //         {
    //             reverse: true
    //         });
    //     $('.input-phoneus').mask('(000) 000-0000');
    //     $('.input-mixed').mask('AAA 000-S0S');
    //     $('.input-ip').mask('0ZZ.0ZZ.0ZZ.0ZZ',
    //         {
    //             translation:
    //             {
    //                 'Z':
    //                 {
    //                     pattern: /[0-9]/,
    //                     optional: true
    //                 }
    //             },
    //             placeholder: "___.___.___.___"
    //         });
    //     // editor
    //     var editor = document.getElementById('editor');
    //     if (editor) {
    //         var toolbarOptions = [
    //             [
    //                 {
    //                     'font': []
    //                 }],
    //             [
    //                 {
    //                     'header': [1, 2, 3, 4, 5, 6, false]
    //                 }],
    //             ['bold', 'italic', 'underline', 'strike'],
    //             ['blockquote', 'code-block'],
    //             [
    //                 {
    //                     'header': 1
    //                 },
    //                 {
    //                     'header': 2
    //                 }],
    //             [
    //                 {
    //                     'list': 'ordered'
    //                 },
    //                 {
    //                     'list': 'bullet'
    //                 }],
    //             [
    //                 {
    //                     'script': 'sub'
    //                 },
    //                 {
    //                     'script': 'super'
    //                 }],
    //             [
    //                 {
    //                     'indent': '-1'
    //                 },
    //                 {
    //                     'indent': '+1'
    //                 }], // outdent/indent
    //             [
    //                 {
    //                     'direction': 'rtl'
    //                 }], // text direction
    //             [
    //                 {
    //                     'color': []
    //                 },
    //                 {
    //                     'background': []
    //                 }], // dropdown with defaults from theme
    //             [
    //                 {
    //                     'align': []
    //                 }],
    //             ['clean'] // remove formatting button
    //         ];
    //         var quill = new Quill(editor,
    //             {
    //                 modules:
    //                 {
    //                     toolbar: toolbarOptions
    //                 },
    //                 theme: 'snow'
    //             });
    //     }
    //     // Example starter JavaScript for disabling form submissions if there are invalid fields
    //     (function () {
    //         'use strict';
    //         window.addEventListener('load', function () {
    //             // Fetch all the forms we want to apply custom Bootstrap validation styles to
    //             var forms = document.getElementsByClassName('needs-validation');
    //             // Loop over them and prevent submission
    //             var validation = Array.prototype.filter.call(forms, function (form) {
    //                 form.addEventListener('submit', function (event) {
    //                     if (form.checkValidity() === false) {
    //                         event.preventDefault();
    //                         event.stopPropagation();
    //                     }
    //                     form.classList.add('was-validated');
    //                 }, false);
    //             });
    //         }, false);
    //     })();

    //     $scope.formAppointmentRequest.appointmentDate = $('#appointmentDateRequest').val()

    //     $('#formAppointmentPatientRecordRequestPatientId').on('change', function () {
    //         $timeout(function () {
    //             var selectedVal = $('#formAppointmentPatientRecordRequestPatientId').val();
    //             $scope.formAppointmentPatientRecordRequest.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
    //         });
    //     });

    //     $('#formAppointmentRequestAppointmentType').on('change', function () {
    //         $timeout(function () {
    //             var selectedVal = $('#formAppointmentRequestAppointmentType').val()
    //             $scope.formAppointmentRequest.appointmentType = processSelect2Service.processSelect2Data(selectedVal)[0]
    //         });
    //     });
    // }

    // $scope.getCurrentTimeInSeconds = () => {
    //     var now = new Date();
    //     return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    // };

    // $scope.timeStringToSeconds = (timeString) => {
    //     var [hours, minutes, seconds] = timeString.split(':').map(Number);
    //     return hours * 3600 + minutes * 60 + (seconds || 0);
    // };

    // $scope.onChangeTimeOfShiftId = function (timeOfShiftId) {
    //     $scope.formDoctorUnavailabilityRequest.timeOfShiftId = timeOfShiftId
    //     $scope.isContinueShow=true
    // }

    // $scope.showFormRegister=($event)=>{
    //     $event.preventDefault()
    //     $scope.isShowFormRegister=true
    // }

    // $scope.comparasionDate = (selectDate) => {
    //     var date = new Date();
    //     date.setHours(0, 0, 0, 0);
    //     if (!(selectDate instanceof Date)) {
    //         selectDate = new Date(selectDate);
    //     }
    //     selectDate.setHours(0, 0, 0, 0);

    //     return selectDate.getTime() === date.getTime();
    // }

    // $scope.initializeUppyUploader = () => {
    //     var uptarg = document.getElementById('drag-drop-area');
    //     if (uptarg) {
    //         var uppy = Uppy.Core().use(Uppy.Dashboard,
    //             {
    //                 inline: true,
    //                 target: uptarg,
    //                 proudlyDisplayPoweredByUppy: false,
    //                 theme: 'dark',
    //                 width: 770,
    //                 height: 210,
    //                 plugins: ['Webcam']
    //             }).use(Uppy.Tus,
    //                 {
    //                     endpoint: 'https://master.tus.io/files/'
    //                 });
    //         uppy.on('complete', (result) => {
    //             console.log('Upload complete! We’ve uploaded these files:', result.successful)
    //         });
    //     }
    // }

    // $scope.listServiceInfo = () => {
    //     $http.get(url + '/service').then(response => {
    //         $scope.listServiceFromDB = response.data
    //     }).catch(error => {
    //         console.log("error", error);
    //     })
    // }

    // $scope.getListPatient = () => {
    //     $http.get(url + '/patient').then(response => {
    //         $scope.listPatientDB = response.data
    //     })
    // }

    // $scope.getListDoctor = () => {
    //     $http.get(url + '/doctor').then(respone => {
    //         $scope.listDoctorDB = respone.data
    //     }).catch(err => {
    //         console.log("Error", err);
    //     })
    // }

    // $scope.getListDoctorSchedule = (date) => {
    //     var dateRequest = {
    //         date: moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")
    //     }
    //     $http.get(url + '/doctor-schedule-by-date', { params: dateRequest }).then(response => {
    //         let doctorMap = new Map();
    //         response.data.forEach(d => {
    //             if (d.doctor) {
    //                 doctorMap.set(d.doctor.doctorId, d.doctor);
    //             }
    //         });

    //         // Chuyển Map thành mảng
    //         $scope.doctorDB = Array.from(doctorMap.values());
    //         $scope.shiftDB = (doctorId) => {
    //             var shift = response.data
    //                 .filter(item => item.doctor && item.doctor.doctorId === doctorId)
    //                 .map(item => item.shift);
    //             return shift
    //         }
    //     })
    // }

    // $scope.timeOfShiftDB = (shiftId, dateSelected, doctorId) => {
    //     var convertedDate = TimezoneService.convertToTimezone(dateSelected, defaultTimezone)
    //     var params = {
    //         shiftId: shiftId,
    //         date: convertedDate,
    //         doctorId: doctorId
    //     }
    //     console.log("params", params);
    //     return $http.get(url + '/time-of-shift-available', { params: params }).then(response => {
    //         return response.data
    //     }).catch(error => {
    //         console.log("Error: " + error)
    //         throw error
    //     })
    // }

    // $scope.getListAppointmentStatus = () => {
    //     $http.get(url + '/appointment-status').then(respone => {
    //         $scope.listAppointmentStatusDB = respone.data
    //         console.log(" $scope.listAppointmentStatusDB", $scope.listDentalStaffDB);
    //     }).catch(err => {
    //         console.log("Error", err);
    //     })
    // }

    // $scope.getListAppointmentType = () => {
    //     $http.get(url + '/appointment-type').then(respone => {
    //         $scope.listAppointmentTypeDB = respone.data
    //     }).catch(err => {
    //         console.log("Error", err);
    //     })
    // }

    // $scope.getListAppointmentStatus = () => {
    //     $http.get(url + '/appointment-status').then(resp => {
    //         $scope.listAppointmentStatusBD = resp.data
    //         $scope.formAppointmentRequest.appointmentStatus = $scope.listAppointmentStatusBD.find((item) => item.status.toLowerCase() === 'đã xác nhận').appointment_StatusId
    //     })
    // }

    // $scope.processDoctorUnavailabilityAllDoctor = () => {
    //     return new Promise((resolve, reject) => {
    //         $http.get(url + '/doctorUnavailability').then((response) => {
    //             resolve(response.data)
    //         }).catch((error) => reject(error))
    //     })
    // }

    // $scope.initData = () => {
    //     $scope.formAppointmentRequest = {
    //         patientId: -1,
    //         appointmentPatientRecord: -1,
    //         appointmentType: -1,
    //         doctorId: -1,
    //         dentalStaffId: dentalStaff,
    //         // appointmentStatus: -1,
    //         appointmentDate: moment(new Date()).format("DD/MM/YYYY"),
    //         note: "",
    //         createAt: "",
    //         isDeleted: false,
    //         appointmentPatientRecord: ""
    //     }
    //     $scope.formDoctorUnavailabilityRequest = {
    //         description: "",
    //         timeOfShiftId: -1,
    //         appointmentId: -1,
    //         date: "",
    //         isDeleted: false
    //     }

    //     $scope.formAppointmentPatientRecordRequest = {
    //         patientId: -1,
    //         createAt: new Date(),
    //         currentCondition: "",
    //         reExamination: "",
    //         isDeleted: false
    //     }
    // }

    // $scope.validationForm = () => {
    //     var patientId = $scope.formAppointmentPatientRecordRequest.patientId
    //     var appointmentType = $scope.formAppointmentRequest.appointmentType
    //     var appointmentDate = $scope.formAppointmentRequest.appointmentDate
    //     var note = $scope.formAppointmentRequest.note
    //     var doctorId = $scope.formAppointmentRequest.doctorId
    //     var tosId = $scope.formDoctorUnavailabilityRequest.timeOfShiftId
    //     var title = $scope.formDoctorUnavailabilityRequest.description
    //     var valid = true

    //     if (title == "" || title == null) {
    //         Swal.fire({
    //             title: "Cảnh báo!",
    //             html: "Vui lòng điền tiêu đề cuộc hẹn!",
    //             icon: "error"
    //         })
    //         valid = false
    //     } else if (patientId == -1) {
    //         Swal.fire({
    //             title: "Cảnh báo!",
    //             html: "Vui lòng chọn bệnh nhân!",
    //             icon: "error"
    //         })
    //         valid = false
    //     } else if (appointmentType == -1) {
    //         Swal.fire({
    //             title: "Cảnh báo!",
    //             html: "Vui lòng chọn loại cuộc hẹn!",
    //             icon: "error"
    //         })
    //         valid = false
    //     } else if (doctorId == -1) {
    //         Swal.fire({
    //             title: "Cảnh báo!",
    //             html: "Vui lòng chọn bác sĩ khám!",
    //             icon: "error"
    //         })
    //         valid = false
    //     } else if (tosId == -1) {
    //         Swal.fire({
    //             title: "Cảnh báo!",
    //             html: "Vui lòng chọn thời gian khám!",
    //             icon: "error"
    //         })
    //         valid = false
    //     }
    //     return valid
    // }

    // $scope.saveAppointment = async () => {
    //     var appointmentDate = moment($scope.formAppointmentRequest.appointmentDate, "DD/MM/YYYY").toDate();
    //     var convertedDate = TimezoneService.convertToTimezone(appointmentDate, defaultTimezone)
    //     $scope.formAppointmentRequest.appointmentDate = convertedDate
    //     var valid = $scope.validationForm()
    //     if (valid) {
    //         try {

    //             var appointmentPatientRecordRequestJSON = angular.toJson($scope.formAppointmentPatientRecordRequest)
    //             console.log("appointmentPatientRecordRequestJSON", appointmentPatientRecordRequestJSON);
    //             var response = await $http.post(url + '/appointment-patient-record', appointmentPatientRecordRequestJSON);

    //             $scope.formAppointmentRequest.appointmentPatientRecord = response.data.appointmentPatientRecordId
    //             $scope.formAppointmentRequest.patientId = response.data.patientId
    //             var appointmentRequestJSON = angular.toJson($scope.formAppointmentRequest);
    //             console.log("appointmentRequestJSON", appointmentRequestJSON);
    //             var resp = await $http.post(url + '/appointment', appointmentRequestJSON);

    //             // Tạo lịch làm việc bác sĩ
    //             $scope.formDoctorUnavailabilityRequest.date = resp.data.appointmentDate;
    //             $scope.formDoctorUnavailabilityRequest.appointmentId = resp.data.appointmentId == null ? null : resp.data.appointmentId
    //             var doctorUnavailabilityRequestJSON = angular.toJson($scope.formDoctorUnavailabilityRequest);
    //             var res = await $http.post(url + '/doctorUnavailability', doctorUnavailabilityRequestJSON);

    //             console.log("Appointment Record response", response);
    //             console.log("Appointment  response", resp);
    //             console.log("DoctorUnavailability response", res);

    //             Swal.fire({
    //                 title: "Thành công!",
    //                 html: "Đặt lịch hẹn thành công",
    //                 icon: "success"
    //             }).then(() => {
    //                 $route.reload()
    //                 // $window.location.reload(); // hoặc sử dụng $route.reload()
    //             })
    //             $scope.initData();
    //             // var collapseElement = document.getElementById('collapseBookAppoinment');
    //             // var bsCollapse = new bootstrap.Collapse(collapseElement, {
    //             //     toggle: false
    //             // });
    //             // bsCollapse.hide();
    //         } catch (error) {
    //             console.log("Error:", error);
    //         }
    //     }
    // }


    // $scope.setupTab()
    // $scope.initData()
    // $scope.initializeFullCalendar();
    // $scope.initializeUIComponents();
    // $scope.initializeUppyUploader();
    // $scope.listServiceInfo()
    // $scope.getListDoctor()
    // $scope.getListPatient()
    // $scope.getListAppointmentStatus()
    // $scope.getListAppointmentType()

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
