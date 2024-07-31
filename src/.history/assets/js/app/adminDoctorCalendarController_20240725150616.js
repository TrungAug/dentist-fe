app.controller('AdminDoctorCalendarController', function ($scope, $http, $rootScope, $location, $timeout, $window, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    const defaultTimezone = "Asia/Ho_Chi_Minh"
    let doctorLogin = 13
    $scope.listServiceByDentalIssuesDBUp = []
    $scope.originalAppointment = []
    $scope.originalAPR = []
    $scope.originalDU = []
    $scope.originalAS = []
    $scope.selectedTimeOfShiftUp = []
    $scope.selectedServicesUp = []
    $scope.selectedServices = []
    $scope.validStatus = ""
    $scope.isSelectByServiceUp = false

    $scope.initReExaminationDate = [
        { value: 5, checked: false },
        { value: 15, checked: false },
        { value: 30, checked: false },
    ]

    $scope.formDoctorUp = {
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
        let fa = $scope.formApp
        let fu = $scope.formDoctorUp

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
            appointmentStatus: isUpdate ? fu.appointmentStatus : fa.appointmentStatus,
            appointmentDate: TimezoneService.convertToTimezone(moment(isUpdate ? fu.appointmentDate : fa.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
            note: isUpdate ? $scope.originalAppointment.note : fa.notes,
            createAt: isUpdate ? fu.createDate : TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            deleted: isUpdate ? fu.deleted : false,
            isDeleted: isUpdate ? fu.deleted : false
        }

    }

    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status').then(resp => {
            $scope.listAppointmentStatusBD = resp.data
            $scope.formDoctorUp.appointmentStatus = $scope.listAppointmentStatusBD.find((item) => item.status.toLowerCase() === 'hoàn thành').appointment_StatusId
        })
    }

    $scope.listServiceInfoUpdate = () => {
        $http.get(url + '/service').then(response => {
            $scope.listServiceFromDB = response.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-service-doctor-update')) {
                $('#dataTable-list-service-doctor-update').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-service-doctor-update').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [5, 10, 20, 30, -1],
                        [5, 10, 20, 30, "All"]
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

    $scope.toggleCheckbox = function ($event, service, isUpdate) {
        $event.stopPropagation();
        service.checked = !service.checked;
        $scope.updateSelectedServices(service, isUpdate);
    }

    $scope.getAllDentalIssuesExceptDeletedUp = () => {
        $http.get(url + '/dental-issues-except-deleted').then(response => {
            $scope.listDentalIssueDBUp = response.data
        })
    }

    $scope.getServiceByDentalIssuesUp = (dentalIssuesIds) => {
        let ids = dentalIssuesIds.join(',')
        let params = {
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

    $scope.isShowService = (isUpdate) => {
        return isUpdate ? $scope.listServiceByDentalIssuesDBUp.length > 0 : $scope.listServiceByDentalIssuesDB.length > 0
    }

    $scope.isContinueShow = () => {
        return $scope.selectedServicesUp.length > 0
    }

    $scope.getTotalPrice = () => {
        return $scope.selectedServicesUp.reduce((total, service) => total + service.price * service.quantity, 0)
    }

    $scope.onChangeReExaminationDate = (number) => {
        let currentDate = new Date()
        $scope.formDoctorUp.reExaminationDate = moment(currentDate).add(number, 'days').format('DD/MM/YYYY');
    }

    $scope.isDisabledStatus = (tableStatus) => {
        const status = tableStatus || $scope.validStatus;
        return status && ['hoàn thành', 'đã hủy', 'không đến', 'hoãn'].includes(status.toLowerCase());
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
                $scope.formDoctorUp.deleted = true
                $scope.isValidServiceUp = false
                $scope.isDisableStatus = true
                break
            case 'hoàn thành':
                $scope.isShowFormResult = true
                $scope.formDoctorUp.deleted = false
                $scope.isValidServiceUp = true
                $scope.isDisableStatus = true
                break
            default:
                $scope.isShowFormResult = false
                $scope.formDoctorUp.deleted = false
                $scope.isValidServiceUp = false
                $scope.isDisableStatus = false
                break
        }
    }

    $scope.processDoctorUnavailability = (doctorId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability').then(response => {
                let filtered = response.data.filter(du => du.appointment.doctor.doctorId === doctorId)
                resolve(filtered)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.getDoctorScheduleExceptDeleted = (doctorId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-except-deleted').then(response => {
                let filtered = response.data.filter(ds => ds.doctor.doctorId === doctorId)
                resolve(filtered)
            }).catch(err => reject(err))
        })
    }

    $scope.processDSWithAppointmentStatus = (curentDate) => {
        let params = {
            date: curentDate
        }
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-with-appointment-status', { params: params }).then(response => {
                let filtered = response.data
                resolve(filtered)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.comparasionDateEvent = (selectDate) => {
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);
        $scope.validDateEvent = selectDate.getTime() >= date.getTime()
    }

    $scope.getOriginalData = (appointmentId) => {
        let params = {
            appId: appointmentId
        }
        let getAppointmentPromise = $http.get(url + '/appointment-id/' + appointmentId).then((response) => {
            $scope.originalAppointment = response.data
            $scope.originalAPR = response.data.appointmentPatientRecord
        })
        let getOriginalDUPromise = $http.get(url + '/doctorUnavailability-by-appid', { params: params }).then((response) => {
            let checkStatus = ['đã hủy', 'không đến', 'hoãn']
            $scope.originalDU = response.data.filter(du => {
                let stt = du.appointment.appointmentStatus
                let isAuth = checkStatus.includes(stt ? du.appointment.appointmentStatus.status.toLowerCase() : 'đã xác nhận')
                return (du.deleted == false) || (du.deleted == true && isAuth)
            })
        })
        let getOriginalASPromise = $http.get(url + '/appointment-service-by-appid', { params: params }).then((response) => {
            $scope.originalAS = response.data
        })

        Promise.all([getAppointmentPromise, getOriginalDUPromise, getOriginalASPromise])
    }

    $scope.generateAppointmentServiceRequest = (selectedServices, appointmentIdResponse, isUpdate) => {
        let dataArray = []
        let fu = $scope.formDoctorUp
        selectedServices.forEach(s => {
            let appointmentServiceRequest = {
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
        let dataArray = []
        let fa = $scope.formApp
        let fu = $scope.formDoctorUp
        selectedTimeOfShift.forEach(tos => {
            let doctorUnavailabilityRequest = {
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

    $scope.closeFormUp = () => {
        $scope.selectedServices = []
        $scope.selectedTimeOfShift = []
        const btnCloseFormDoctorUp = document.getElementById('btn-close-formDoctorUp')
        btnCloseFormDoctorUp.click()
        $route.reload()
    }

    $scope.processDataUpdate = (originalArr, reqArr) => {

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


    $scope.doctorUpdateAppointment = () => {
        const isUpdate = true
        $scope.initDataRequest(isUpdate)

        let originalApr = $scope.originalAPR
        let originalApp = $scope.originalAppointment
        // let originalDu = $scope.originalDU
        let originalAs = $scope.originalAS

        let aprId = originalApr.appointmentPatientRecordId
        let appId = originalApp.appointmentId
        // let duId = []
        let apsId = []
        // originalDu.forEach(du => {
        //     duId.push(du.doctorUnavailabilityId)
        // })
        originalAs.forEach(aps => {
            apsId.push(aps.appointment_ServiceId)
        })

        // if ($scope.selectedTimeOfShiftUp.length == 0) {
        //     originalDu.forEach(du => {
        //         $scope.selectedTimeOfShiftUp.push(du.timeOfShift)
        //     })
        // }

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

        if (!$scope.formDoctorUp.isReExamination) {
            $scope.formDoctorUp.reExaminationDate = ""
        }

        let reqApr = $scope.appointmentPatientRecordRequest
        let reqApp = $scope.appointmentRequest
        //let reqDu = $scope.generateDoctorUnavailabilityRequest($scope.selectedTimeOfShiftUp, appId, isUpdate)
        let reqAs = $scope.generateAppointmentServiceRequest($scope.selectedServicesUp, appId, isUpdate)


        let reqAprData = $scope.processDataUpdate(originalApr, reqApr)
        let reqAppData = $scope.processDataUpdate(originalApp, reqApp)
        //let reqDuData = $scope.processDataUpdate(originalDu, reqDu)
        let reqAsData = $scope.processDataUpdate(originalAs, reqAs)
        const aprKey = "appointmentPatientRecordId"
        const appKey = "appointmentId"
        //const duKey = "doctorUnavailabilityId"
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
            // handleApiRequest(url + "/soft-delete-doctorUnavailability", url + "/doctorUnavailability", url + "/doctorUnavailability", reqDuData, duKey),
            handleApiRequest(url + "/soft-delete-appointment-service", url + "/appointment-service", url + "/appointment-service", reqAsData, asKey)
        ]).then(result => {
            Swal.fire({
                title: "Thành công!",
                html: "Cập nhật cuộc hẹn thành công",
                icon: "success"
            }).then(rs => {
                const btnCloseFormUpApp = document.getElementById('btn-close-formDoctorUp')
                btnCloseFormUpApp.click()
                $route.reload()
            })
        }).catch(error => {
            console.error("Lỗi cập nhật cuộc hẹn", error);
        })
    }

    $scope.initializeDoctorCalendar = () => {
        let calendar;
        let resources = [];
        let eventArr = [];

        const loadResourcesAndEvents = (currentDate) => {
            $scope.processDSWithAppointmentStatus(currentDate).then(result => {
                resources = [];
                for (let key in result) {
                    if (result.hasOwnProperty(key) && parseInt(key.split('-')[0]) === doctorLogin) {
                        let obj = {
                            id: key.split('-')[0],
                            title: key.split('-')[1],
                        };
                        resources.push(obj);
                    }
                }
                resources.sort((a, b) => a.id - b.id);
                loadDoctorUnavailability()
            })
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
                updateCalendar();
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
            const calendarEl = document.getElementById('doctor-calendar-schedule');
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

                    $scope.formDoctorUp = {
                        reExaminationDate: originalApp.appointmentPatientRecord.reExamination,
                        currentCondition: originalApp.appointmentPatientRecord.currentCodition,
                        appointmentDate: $scope.originalDate,
                        fullName: originalApp.patient.fullName,
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

                    const btnDoctorUpdateAppointment = document.getElementById('btnDoctorUpdateAppointment');
                    btnDoctorUpdateAppointment.click();
                },
                datesRender: function (info) {
                    $scope.fullCalendarDate = info.view.currentStart;
                    loadResourcesAndEvents(info.view.currentStart);
                    let now = new Date();
                    now.setMinutes(now.getMinutes() - 15);
                    let tdElements = calendarEl.querySelectorAll('td.fc-widget-content.fc-minor, td.fc-widget-content.fc-major')
                    tdElements.forEach(td => {
                        let tdDate = new Date(td.getAttribute('data-date'));
                        let isPast = tdDate < now || (tdDate.getHours() === 7 && tdDate.getMinutes() < 30) || tdDate.getHours() >= 21;
                        if (isPast) {
                            td.classList.add('fc-custom-past');
                        }
                    });
                },

            });

            calendar.render();
            let licenseMessage = document.querySelector('.fc-license-message');
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
                minDate: moment().format('DD/MM/YYYY') && $scope.formDoctorUp.appointmentDate,
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
                minDate: moment().format('DD/MM/YYYY') && $scope.formDoctorUp.reExaminationDate,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker-reExam').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.formDoctorUp.reExaminationDate = selectedDate
        });

        $('.drgpicker-up').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.formDoctorUp.appointmentDate = selectedDate
        });

        $('#dental-issues-doctorUp').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#dental-issues-doctorUp').val()
                selecteDentalIssues = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getServiceByDentalIssuesUp(selecteDentalIssues)
                let getDentalIssueNames = $scope.listDentalIssueDBUp
                    .filter(di => selecteDentalIssues.includes(di.dentalIssuesId))
                    .map(di => di.name)
                $scope.formDoctorUp.currentCondition = getDentalIssueNames.join(', ')

            });
        });

        $('#appointmentStatusDoctorUp').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentStatusDoctorUp').val()
                $scope.formDoctorUp.appointmentStatus = processSelect2Service.processSelect2Data(selectedVal)[0]
                $scope.processChangeAppStatus($scope.formDoctorUp.appointmentStatus)

            });
        });
    }

    $('#doctorUpdateAppointment').on('shown.bs.modal', function () {
        $scope.initializeUIComponentsModal()
        $scope.listServiceInfoUpdate()
        $scope.getListAppointmentStatus()
        $scope.getAllDentalIssuesExceptDeletedUp()
    })

    $scope.initializeDoctorCalendar()
});