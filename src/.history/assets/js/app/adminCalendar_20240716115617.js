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
    $scope.listServiceByDentalIssuesDBUp = []
    $scope.listDoctorDB = []
    $scope.listAppointmentDB = []
    $scope.listTimeOfShiftByRangeTimeDB = []
    $scope.listDuDB = []
    $scope.selectedServices = []
    $scope.selectedServicesUp = []
    $scope.arrSelectedTemp = []
    $scope.selectedTimeOfShift = []
    $scope.selectedTimeOfShiftUp = []
    $scope.listTOS = []
    $scope.listTOSFilter = []
    $scope.showFormRegister = false
    $scope.disableContinue = false
    $scope.isSelectCalendar = false
    $scope.isUpdate = false
    $scope.isShowFormResult = false
    $scope.isValidServiceUp = false
    $scope.showNextStepUp = false
    $scope.originalAppointment = []
    $scope.originalAPR = []
    $scope.originalDU = []
    $scope.originalAS = []
    $scope.fullCalendarDate = new Date()
    $scope.validStatus = ""

    $scope.formApp = {
        appointmentDate: moment(new Date).format('DD/MM/YYYY'),
        doctorId: -1,
        title: '',
        appointmentTypeId: -1,
        patientId: -1,
        notes: '',
        fullName: "",
        startTime: "",
        endTime: ""
    }
    $scope.formUpApp = {
        reExaminationDate: moment(new Date).format('DD/MM/YYYY'),
        currentCondition: "",
        appointmentDate: moment(new Date).format('DD/MM/YYYY'),
        fullName: "",
        startTime: "",
        endTime: "",
        patientId: "",
        appointmentStatus: "",
        appointmentTypeId: "",
        deleted: false,
        quantity: 1,
        isReExamination: false
    }

    $scope.initDataRequest = (isUpdate) => {
        var fa = $scope.formApp
        var fu = $scope.formUpApp

        $scope.appointmentPatientRecordRequest = {
            patientId: isUpdate ? fu.patientId : fa.patientId,
            createAt: isUpdate ? fu.createDate : TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            currentCondition: isUpdate ? fu.currentCondition : "",
            reExamination: isUpdate ? fu.reExaminationDate : "",
            deleted: isUpdate ? fu.deleted : false,
            isDeleted: isUpdate ? fu.deleted : false
        }

        $scope.appointmentRequest = {
            patientId: isUpdate ? fu.patientId : fa.patientId,
            appointmentPatientRecord: isUpdate ? $scope.originalAPR.appointmentPatientRecordId : -1,
            appointmentType: isUpdate ? fu.appointmentTypeId : fa.appointmentTypeId,
            doctorId: isUpdate ? fu.doctorId : fa.doctorId,
            dentalStaffId: dentalStaff,
            appointmentStatus: isUpdate ? fu.appointmentStatus : fa.appointmentStatus,
            appointmentDate: TimezoneService.convertToTimezone(moment(isUpdate ? fu.appointmentDate : fa.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
            note: isUpdate ? $scope.originalAppointment.note : fa.notes,
            createAt: isUpdate ? fu.createDate : TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            deleted: isUpdate ? fu.deleted : false,
            isDeleted: isUpdate ? fu.deleted : false
        }

    }


    $scope.isShowService = (isUpdate) => {
        return isUpdate ? $scope.listServiceByDentalIssuesDBUp.length > 0 : $scope.listServiceByDentalIssuesDB.length > 0
    }


    $scope.isContinueShow = () => {
        return $scope.selectedServices.length > 0
    }

    $scope.isShowFormRegister = ($event) => {
        $event.preventDefault()
        $scope.showFormRegister = true
    }

    $scope.updateSelectedServices = (service, isUpdate) => {
        const updateServiceList = (service, list) => {
            if (service.checked) {
                list.push(service);
            } else {
                const index = list.findIndex(s => s.serviceId === service.serviceId);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
        };

        if (isUpdate) {
            updateServiceList(service, $scope.selectedServicesUp);
        }
        updateServiceList(service, $scope.selectedServices);
    }

    $scope.toggleAll = (isUpdate) => {
        const toggleSelectAll = (selectAllId, listServiceDB, selectedServices) => {
            const selectAll = document.getElementById(selectAllId).checked;
            $scope[selectedServices] = listServiceDB.filter(service => {
                service.checked = selectAll;
                return selectAll;
            });
        };

        if (isUpdate) {
            toggleSelectAll('selectAllUp', $scope.listServiceByDentalIssuesDBUp, 'selectedServicesUp');
        }
        toggleSelectAll('selectAll', $scope.listServiceByDentalIssuesDB, 'selectedServices');
    }

    $scope.toggleCheckbox = function ($event, service, isUpdate) {
        $event.stopPropagation();
        service.checked = !service.checked;
        $scope.updateSelectedServices(service, isUpdate);
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
            $scope.showFormRegister = false
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

    $scope.getAllDentalIssuesExceptDeletedUp = () => {
        $http.get(url + '/dental-issues-except-deleted').then(response => {
            $scope.listDentalIssueDBUp = response.data
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

    $scope.getServiceByDentalIssuesUp = (dentalIssuesIds) => {
        var ids = dentalIssuesIds.join(',')
        var params = {
            ids: ids
        }
        $http.get(url + '/service-by-dental-issues', { params: params }).then(response => {
            $scope.listServiceByDentalIssuesDBUp = response.data.map(service => {
                if (service.quantity === undefined || service.quantity === null) {
                    service.quantity = 1
                }
                return service;
            });
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

    $scope.getListAppointment = () => {
        $http.get(url + '/appointment').then(resp => {
            $scope.listAppointmentDB = resp.data
            const today = moment(new Date()).format('YYYY-MM-DD');
            const past = moment(today).subtract(1, 'days').format('YYYY-MM-DD');
            
            $scope.listAppointmentDBToday=$scope.listAppointmentDB.filter(app=>app.createAt===today)
            $scope.listAppointmentDBPast=$scope.listAppointmentDB.filter(app=>app.createAt===past)

            let todayLength=$scope.listAppointmentDBToday.length
            let pastLength=$scope.listAppointmentDBPast.length         
            let caculator=((todayLength - pastLength) / (pastLength==0?1:pastLength)) * 100
       
            $scope.appFluctuate = Math.round(caculator);
            $scope.appFluctuate = parseFloat($scope.appFluctuate.toFixed(2))
        })
    }

    $scope.getListAppointmentBySatus = (listAppointmentDB, st) => {

        if (listAppointmentDB.length === 0) {
            return 0;
        } else {
            let filteredData = listAppointmentDB.filter(app => {
                return app.appointmentStatus && app.appointmentStatus.appointment_StatusId === st.appointment_StatusId
            });
            let percent = (filteredData.length / listAppointmentDB.length) * 100;
            return [st.status, Math.round(percent),filteredData.length];
        }
    }

    $scope.getAllDoctorUnavailabilityExceptDeleted = () => {
        $http.get(url + '/doctorUnavailability-except-deleted').then(response => {
            $scope.listDuDB = response.data
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

    $scope.getDoctorScheduleShiftsExcludingDeleted = (date, doctorId) => {
        var params = {
            date: date,
            doctorId: doctorId
        }
        return new Promise((resolve, reject) => {
            $http.get(url + '/get-doctor-shifts-excluding-deleted', { params: params }).then(response => {
                resolve(response.data)
            }).catch(err => reject(err))
        })
    }

    $scope.getAllDoctorScheduleExceptDeleted = () => {
        return new Promise((resolve, reject) => {
            // /doctor-schedule-and-tos
            $http.get(url + '/doctor-schedule-except-deleted').then(response => {
                resolve(response.data)
            }).catch(err => reject(err))
        })
    }

    $scope.getTimeOfShiftByShiftId = (shiftId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/time-of-shift-by-shift-id/' + shiftId).then(response => {
                resolve(response.data)
            }).catch(err => reject(err))
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

    $scope.isTimeLess = (tos, isUpdate) => {
        var timeLess = true
        var dateSelected = moment($scope.formApp.appointmentDate, "DD/MM/YYYY").toDate()
        if (isUpdate) {
            dateSelected = moment($scope.formUpApp.appointmentDate, "DD/MM/YYYY").toDate()
        }
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

    $scope.showBaseInAppStatus = (orginalAppointment) => {
        var status = orginalAppointment.status.toLowerCase()
        var validStatus = false
        switch (status) {
            case "đã xác nhận":
            case "đã đặt":
                validStatus = true
            default:
                validStatus = false
        }
        return validStatus
    }

    $scope.getOriginalData = (appointmentId) => {
        var params = {
            appId: appointmentId
        }
        var getAppointmentPromise = $http.get(url + '/appointment-id/' + appointmentId).then((response) => {
            $scope.originalAppointment = response.data
            $scope.originalAPR = response.data.appointmentPatientRecord
        })
        var getOriginalDUPromise = $http.get(url + '/doctorUnavailability-by-appid', { params: params }).then((response) => {
            $scope.originalDU = response.data
        })
        var getOriginalASPromise = $http.get(url + '/appointment-service-by-appid', { params: params }).then((response) => {
            $scope.originalAS = response.data
            console.log("$scope.originalAS", $scope.originalAS);
        })

        Promise.all([getAppointmentPromise, getOriginalDUPromise, getOriginalASPromise])
    }

    $scope.setupTab = () => {
        $scope.currentTab = { shiftId: -1, doctorId: -1 }

        $scope.selectTab = (shiftId, doctorId, $event, isUpdate) => {
            var dateSelected = moment($scope.formApp.appointmentDate, "DD/MM/YYYY").toDate();
            if (isUpdate) {
                dateSelected = moment($scope.formUpApp.appointmentDate, "DD/MM/YYYY").toDate();
                $scope.formUpApp.doctorId = doctorId
            }
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

    $scope.onChangeTimeOfShift = (tos, isUpdate, doctorId) => {
        console.log("doctorId huhu", doctorId);
        let item = [tos, doctorId]

        const findDoctor = (doctorId) => {
            return $scope.arrSelectedTemp.some(item => item[1] === doctorId)
        }

        if (tos.checked) {
            if ($scope.arrSelectedTemp.length > 0) {
                let isAuth = findDoctor(doctorId)
                if (!isAuth) {
                    $scope.arrSelectedTemp = []
                }
            }
            $scope.arrSelectedTemp.push(item)
        } else {
            let index = $scope.arrSelectedTemp.findIndex(item => item[0].timeOfShiftId === tos.timeOfShiftId)
            if (index !== -1) {
                $scope.arrSelectedTemp.splice(index, 1)
            }
        }

        $scope.selectedTimeOfShift = [];
        $scope.selectedTimeOfShiftUp = [];

        if ($scope.arrSelectedTemp.length > 0) {
            $scope.arrSelectedTemp.forEach(item => {
                if (isUpdate) {
                    $scope.selectedTimeOfShiftUp.push(item[0]);
                }
                $scope.selectedTimeOfShift.push(item[0]);
            });
        }

        console.log("selectedTimeOfShiftUp", $scope.selectedTimeOfShiftUp);
        console.log("selectedTimeOfShift", $scope.selectedTimeOfShift);

        // if (tos.checked) {
        //     if (isUpdate) {
        //         $scope.selectedTimeOfShiftUp.push(tos);
        //     }
        //     $scope.selectedTimeOfShift.push(tos);
        // } else {
        //     if (isUpdate) {
        //         const index = $scope.selectedTimeOfShiftUp.indexOf(tos.timeOfShiftId);
        //         if (index !== -1) {
        //             $scope.selectedTimeOfShiftUp.splice(index, 1);
        //         }
        //     }
        //     const index = $scope.selectedTimeOfShift.indexOf(tos.timeOfShiftId);
        //     if (index !== -1) {
        //         $scope.selectedTimeOfShift.splice(index, 1);
        //     }
        // }
    }

    $scope.generateAppointmentServiceRequest = (selectedServices, appointmentIdResponse, isUpdate) => {
        var dataArray = []
        var fu = $scope.formUpApp
        selectedServices.forEach(s => {
            var appointmentServiceRequest = {
                appointmentId: appointmentIdResponse, //respone
                serviceId: s.serviceId,
                quantity: s.quantity ? s.quantity : 1,
                price: s.price,
                deleted: isUpdate ? fu.deleted : false,
                isDeleted: isUpdate ? fu.deleted : false
            }
            dataArray.push(appointmentServiceRequest)
        })
        return dataArray
    }

    $scope.generateDoctorUnavailabilityRequest = (selectedTimeOfShift, appointmentIdResponse, isUpdate) => {
        var dataArray = []
        var fa = $scope.formApp
        var fu = $scope.formUpApp
        selectedTimeOfShift.forEach(tos => {
            var doctorUnavailabilityRequest = {
                description: "",
                timeOfShiftId: tos.timeOfShiftId,
                appointmentId: appointmentIdResponse,//respone
                date: TimezoneService.convertToTimezone(moment(isUpdate ? fu.appointmentDate : fa.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
                deleted: isUpdate ? fu.deleted : false,
                isDeleted: isUpdate ? fu.deleted : false
            }
            dataArray.push(doctorUnavailabilityRequest)
        })
        return dataArray;
    }

    $scope.validationForm = () => {
        let patientId = $scope.formApp.patientId
        let doctorId = $scope.formApp.doctorId
        let tosArr = $scope.selectedTimeOfShift
        let serviceArr = $scope.selectedServices
        let title = $scope.formApp.title
        let appType = $scope.formApp.appointmentTypeId
        let valid = true

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
        console.log("$scope.selectedTimeOfShift", $scope.selectedTimeOfShift);
        var isUpdate = false
        $scope.initDataRequest(isUpdate)
        var valid = $scope.validationForm()
        if (valid) {
            try {
                var dataAPRReq = angular.toJson($scope.appointmentPatientRecordRequest)

                var responseApr = await $http.post(url + '/appointment-patient-record', dataAPRReq)
                $scope.appointmentRequest.appointmentPatientRecord = responseApr.data.appointmentPatientRecordId

                var dataAppoinmentReq = angular.toJson($scope.appointmentRequest)
                var respApp = await $http.post(url + '/appointment', dataAppoinmentReq)

                var appointmentId = respApp.data.appointmentId == null ? null : respApp.data.appointmentId

                var dataArrayDUReq = $scope.generateDoctorUnavailabilityRequest($scope.selectedTimeOfShift, appointmentId, isUpdate)
                var dataArrayServiceReq = $scope.generateAppointmentServiceRequest($scope.selectedServices, appointmentId, isUpdate)

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
                console.error('Có lỗi xảy ra khi đặt lịch hẹn:', error);
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

    $scope.processDSWithAppointmentStatus = (curentDate) => {
        var params = {
            date: curentDate
        }
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-with-appointment-status', { params: params }).then(response => {
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
        var params = {
            startStr: startStr,
            endStr: endStr
        }
        $http.get(url + '/time-of-shift-by-range', { params: params }).then(response => {
            $scope.selectedTimeOfShift = response.data
        })
    }

    $scope.processChangeAppStatus = (statusId) => {
        let st = $scope.listAppointmentStatusBD.find(s => s.appointment_StatusId === statusId)
        if (!st) {
            console.log("Không tìm thấy trạng thái với id:", statusId);
            return
        }
        switch (st.status.toLowerCase()) {
            case 'đã hủy':
            case 'không đến':
            case 'hoãn':
                $scope.isShowFormResult = false
                $scope.formUpApp.deleted = true
                $scope.isValidServiceUp = false
                $scope.isDisableStatus = true
                break
            case 'hoàn thành':
                $scope.isShowFormResult = true
                $scope.formUpApp.deleted = false
                $scope.isValidServiceUp = true
                $scope.isDisableStatus = true
                break
            default:
                $scope.isShowFormResult = false
                $scope.formUpApp.deleted = false
                $scope.isValidServiceUp = false
                $scope.isDisableStatus = false
                break
        }
    }

    $scope.isDisabledStatus = () => {
        if ($scope.validStatus) {
            return ['hoàn thành', 'đã hủy', 'không đến', 'hoãn'].includes($scope.validStatus.toLowerCase())
        }
    }

    $scope.comparasionDateEvent = (selectDate) => {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);
        $scope.validDateEvent = selectDate.getTime() >= date.getTime()
        console.log("$scope.validDateEvent", $scope.validDateEvent);
    }

    $scope.closeFormUp = () => {
        $scope.selectedServices = []
        $scope.selectedTimeOfShift = []
        const btnCloseFormUpApp = document.getElementById('btn-close-formUpApp')
        btnCloseFormUpApp.click()
        $route.reload()
    }

    $scope.processDataUpdate = (originalArr, reqArr) => {
        // const ensureArray = arr => Array.isArray(arr) ? arr : [arr];
        // originalArr = ensureArray(originalArr);
        // reqArr = ensureArray(reqArr);
        const oL = originalArr.length
        const rL = reqArr.length

        let updateArr = [];
        let deleteArr = [];
        let postArr = [];
        if (oL > rL) {
            deleteArr = originalArr.slice(rL)
            updateArr = [originalArr.slice(0, rL), reqArr]
        } else if (oL < rL) {
            updateArr = [originalArr, reqArr.slice(0, oL)]
            postArr = reqArr.slice(oL)
        } else {
            updateArr = [originalArr, reqArr]
        }
        return {
            updateArr: [updateArr],
            deleteArr: [deleteArr],
            postArr: [postArr]
        }
    }


    $scope.updateAppointment = () => {
        const isUpdate = true
        $scope.initDataRequest(isUpdate)

        let originalApr = $scope.originalAPR
        let originalApp = $scope.originalAppointment
        let originalDu = $scope.originalDU
        let originalAs = $scope.originalAS

        let aprId = originalApr.appointmentPatientRecordId
        let appId = originalApp.appointmentId
        let duId = []
        let apsId = []
        originalDu.forEach(du => {
            duId.push(du.doctorUnavailabilityId)
        })
        originalAs.forEach(aps => {
            apsId.push(aps.appointment_ServiceId)
        })

        if ($scope.selectedTimeOfShiftUp.length == 0) {
            $scope.selectedTimeOfShiftUp = $scope.selectedTosOriginal
        }

        if ($scope.selectedServicesUp.length == 0) {
            if ($scope.isValidServiceUp) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Bạn chưa chọn dịch vụ",
                    icon: "warning"
                })
                return
            }
            originalAs.forEach(as => {
                $scope.selectedServicesUp.push(as.service)
            })
        }

        if (!$scope.formUpApp.isReExamination) {
            $scope.formUpApp.reExaminationDate = ""
        }

        let reqApr = $scope.appointmentPatientRecordRequest
        let reqApp = $scope.appointmentRequest
        let reqDu = $scope.generateDoctorUnavailabilityRequest($scope.selectedTimeOfShiftUp, appId, isUpdate)
        let reqAs = $scope.generateAppointmentServiceRequest($scope.selectedServicesUp, appId, isUpdate)


        let reqAprData = $scope.processDataUpdate(originalApr, reqApr)
        let reqAppData = $scope.processDataUpdate(originalApp, reqApp)
        let reqDuData = $scope.processDataUpdate(originalDu, reqDu)
        let reqAsData = $scope.processDataUpdate(originalAs, reqAs)
        const aprKey = "appointmentPatientRecordId"
        const appKey = "appointmentId"
        const duKey = "doctorUnavailabilityId"
        const asKey = "appointment_ServiceId"


        const handleApiRequest = (deleteUrl, postUrl, putUrl, data, idKey) => {
            const promises = []
            const ensureArray = arr => Array.isArray(arr) ? arr : [arr]
            if (data.deleteArr.length !== 0) {
                data.deleteArr.forEach(arrReq => {
                    if (arrReq.length === 0) return
                    arrReq.forEach(itemReq => {
                        promises.push($http.delete(`${deleteUrl}/${itemReq[idKey]}`))
                    })
                });
            }

            if (data.postArr.length !== 0) {
                data.postArr.forEach(arrReq => {
                    if (arrReq.length === 0) return
                    arrReq.forEach(itemReq => {
                        promises.push($http.post(postUrl, itemReq))
                    })
                });
            }

            if (data.updateArr.length !== 0) {
                data.updateArr.forEach(arrReq => {
                    if (arrReq.length === 0) return
                    let oItem = ensureArray(arrReq[0])
                    let uItem = ensureArray(arrReq[1])
                    oItem.forEach(o => {
                        const id = o[idKey]
                        uItem.forEach(u => {
                            console.log("u", u);
                            console.log("url", `${putUrl}/${id}`);
                            promises.push($http.put(`${putUrl}/${id}`, u))
                        })
                    })
                })
            }

            return Promise.all(promises)
        };

        Promise.all([
            handleApiRequest(url + "/soft-delete-appointment-patient-record", url + "/appointment-patient-record", url + "/appointment-patient-record", reqAprData, aprKey),
            handleApiRequest(url + "/soft-delete-appointment", url + "/appointment", url + "/appointment", reqAppData, appKey),
            handleApiRequest(url + "/soft-delete-doctorUnavailability", url + "/doctorUnavailability", url + "/doctorUnavailability", reqDuData, duKey),
            handleApiRequest(url + "/soft-delete-appointment-service", url + "/appointment-service", url + "/appointment-service", reqAsData, asKey)
        ]).then(result => {
            Swal.fire({
                title: "Thành công!",
                html: "Cập nhật cuộc hẹn thành công",
                icon: "success"
            }).then(rs => {
                const btnCloseFormUpApp = document.getElementById('btn-close-formUpApp')
                btnCloseFormUpApp.click()
                $route.reload()
            })
        }).catch(error => {
            console.error("Lỗi cập nhật cuộc hẹn", error);
        })
    }

    $scope.reSelect = () => {
        $scope.formApp = {
            appointmentDate: moment(new Date).format('DD/MM/YYYY'),
            doctorId: -1,
            title: '',
            appointmentTypeId: -1,
            patientId: -1,
            notes: '',
            fullName: "",
            startTime: "",
            endTime: ""
        }
        $scope.isSelectCalendar = false
        const divRegisterAppointment = document.getElementById('div-register-appointment');
        divRegisterAppointment.click();
    }

    $scope.initializeUIComponentsModal = () => {

        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            });

        $('.select2-multi-up').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });

        $('.drgpicker-up').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().format('DD/MM/YYYY') && $scope.formUpApp.appointmentDate,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker-reExam').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().format('DD/MM/YYYY') && $scope.formUpApp.reExaminationDate,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker-reExam').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.formUpApp.reExaminationDate = selectedDate
        });

        $('.drgpicker-up').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.getListDoctorSchedule(selectedDate)
            $scope.formUpApp.appointmentDate = selectedDate
            $scope.showNextStepUp = true
        });

        $('#dental-issuesUp').on('change', function () {
            $timeout(function () {
                var selectedVals = $('#dental-issuesUp').val()
                selecteDentalIssues = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getServiceByDentalIssuesUp(selecteDentalIssues)
                var getDentalIssueNames = $scope.listDentalIssueDBUp
                    .filter(di => selecteDentalIssues.includes(di.dentalIssuesId))
                    .map(di => di.name)
                $scope.formUpApp.currentCondition = getDentalIssueNames.join(' ,')

            });
        });
        $('#appointmentPatientUp').on('change', function () {
            $timeout(function () {
                var selectedVal = $('#appointmentPatientUp').val();
                $scope.formUpApp.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
        $('#appointmentTypeUp').on('change', function () {
            $timeout(function () {
                var selectedVal = $('#appointmentTypeUp').val()
                $scope.formUpApp.appointmentTypeId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
        $('#appointmentStatusUp').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentStatusUp').val()
                $scope.formUpApp.appointmentStatus = processSelect2Service.processSelect2Data(selectedVal)[0]
                $scope.processChangeAppStatus($scope.formUpApp.appointmentStatus)

            });
        });
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
            $scope.showNextStepUp = true
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
                $scope.formApp.title = getDentalIssueNames.join(' ,')
                $('#appointmentTitle').val(getDentalIssueNames.join(' ,'));
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

        $('#appointmentStatus').on('change', function () {
            $timeout(function () {
                var selectedVal = $('#appointmentStatus').val()
                $scope.formApp.appointmentStatus = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
    }

    $scope.initializeCalendarAppointment = () => {
        let calendar;
        let resources = [];
        let eventArr = [];

        const loadResourcesAndEvents = (currentDate) => {
            $scope.processDSWithAppointmentStatus(currentDate).then(result => {
                resources = [];
                for (let key in result) {
                    if (result.hasOwnProperty(key)) {
                        let obj = {
                            id: key.split('-')[0],
                            title: key.split('-')[1],
                        };
                        resources.push(obj);
                    }
                }
                resources.sort((a, b) => a.id - b.id);
                loadDoctorUnavailability();
            });
        };

        const loadDoctorUnavailability = () => {
            eventArr = []

            $scope.processDoctorUnavailability().then(dataDu => {
                dataDu.forEach(du => {
                    var status = du.appointment.appointmentStatus;
                    var color = status ? $scope.getColorForStatusId(du.appointment.appointmentStatus.status) : 'rgba(92, 184, 92, 0.7)';
                    var event = {
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
                updateCalendar();
            });

            $scope.getAllDoctorScheduleExceptDeleted().then(dataDs => {
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
                updateCalendar();
            })
        };

        const updateCalendar = () => {
            calendar.getResources().forEach(resource => {
                calendar.getResourceById(resource.id).remove();
            });
            resources.forEach(resource => {
                calendar.addResource(resource);
            });

            calendar.getEvents().forEach(event => {
                event.remove();
            });
            eventArr.forEach(event => {
                calendar.addEvent(event);
            });
        };

        const renderCalendar = () => {
            const calendarEl = document.getElementById('calendar-book-appointment');
            calendar = new FullCalendar.Calendar(calendarEl, {
                plugins: ['interaction', 'resourceTimeline'],
                defaultView: 'resourceTimelineDay',
                timeZone: 'Asia/Ho_Chi_Minh',
                themeSystem: 'bootstrap',
                dragScroll: true,
                locale: 'vi',
                aspectRatio: 4,
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'resourceTimelineDay'
                },
                editable: false,//không cho drag và resize events            
                slotDuration: '00:30:00',
                maxTime: "22:00:00",
                minTime: "07:00:00",
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

                    var events = calendar.getEvents().filter(event => {
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

                    var hasAppointment = events.some(event => event.id !== "" && event.extendedProps.appointment.deleted == false)
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

                    var now = new Date();
                    var startDate = new Date(arg.startStr);
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
                    $scope.formApp.startTime = arg.startStr.split("T")[1]
                    $scope.formApp.endTime = arg.endStr.split("T")[1]
                    // $scope.startDate = arg.startStr.split("T")[0];
                    $scope.isSelectCalendar = true;
                    $scope.$apply();
                    const divRegisterAppointment = document.getElementById('div-register-appointment');
                    divRegisterAppointment.click();

                },
                eventClick: function (arg) {
                    console.log("arg", arg);
                    if (arg.event.id === "") {
                        return
                    }
                    var originalApp = arg.event.extendedProps.appointment
                    if (originalApp == null) {
                        return
                    }

                    $scope.getOriginalData(parseInt(arg.event.id));
                    $scope.originalDate = moment(originalApp.appointmentDate, ('YYYY-MM-DD')).format('DD/MM/YYYY')
                    $scope.comparasionDateEvent(originalApp.appointmentDate)
                    $scope.selectedTosOriginal = [arg.event.extendedProps.tos]
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
                datesRender: function (info) {
                    $scope.fullCalendarDate = info.view.currentStart;
                    loadResourcesAndEvents(info.view.currentStart);
                    var now = new Date();
                    now.setMinutes(now.getMinutes() - 15);
                    var tdElements = calendarEl.querySelectorAll('td.fc-widget-content.fc-minor, td.fc-widget-content.fc-major')
                    tdElements.forEach(td => {
                        var tdDate = new Date(td.getAttribute('data-date'));
                        var isPast = tdDate < now || (tdDate.getHours() === 7 && tdDate.getMinutes() < 30) || tdDate.getHours() >= 21;
                        if (isPast) {
                            td.classList.add('fc-custom-past');
                        }
                    });
                },

            });

            calendar.render();
            var licenseMessage = document.querySelector('.fc-license-message');
            if (licenseMessage) {
                licenseMessage.parentNode.removeChild(licenseMessage);
            }
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

    $('#updateAppointment').on('shown.bs.modal', function () {
        $scope.initializeUIComponentsModal()
    })

    // list appointment

    


    $scope.getAllDentalIssuesExceptDeleted()
    $scope.getAllDentalIssuesExceptDeletedUp()
    $scope.initializeCalendarAppointment()
    $scope.initializeUIComponents()
    $scope.setupTab()
    $scope.getListAppointmentType()
    $scope.getListAppointmentStatus()
    $scope.getListPatient()
    $scope.getListAppointment()
    $scope.getAllDoctorUnavailabilityExceptDeleted()


})


