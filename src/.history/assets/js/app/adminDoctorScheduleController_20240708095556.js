app.controller('AdminDoctorScheduleController', function ($scope, $http, $rootScope, $location, $timeout, $window, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    var defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.listDoctorScheduleDB = []
    $scope.listDoctorShiftsDB = []
    $scope.listDoctorShiftsUnavailabilityDB = []
    $scope.listDoctorScheduleByTimeRangesDB=[]
    var registeredDates = ""
    $scope.isChangeSchedule = false
    $scope.selectedDoctors = []
    $scope.selectedShifts = []
    $scope.originalScheduleIds = []
    $scope.selectedShiftsUnavailability = []
    $scope.originalScheduleIdsUnavailability = []
    $scope.originalDate = ""
    $scope.selectedDates = []
    $scope.startDate = ""
    $scope.endDate = ""

    $scope.formDoctorSchedule = {
        doctorScheduleId: -1,
        date: moment().format('DD/MM/YYYY'),
        shiftId: '',
        doctorId: '',
        available: true,
        createAt: new Date(),
        updateAt: '',
        fullName:''
    }
    

    $scope.getListShift = () => {
        $http.get(url + "/shift").then(respone => {
            $scope.listShiftDB = respone.data
        }).catch(err => {
            console.log("error", err);
        })
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(respone => {
            $scope.listDoctorDB = respone.data
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getDoctor = (doctorId) => {
        var index = $scope.selectedDoctors.indexOf(doctorId)
        if (index === -1) {
            $scope.selectedDoctors.push(doctorId)
        } else {
            $scope.selectedDoctors.splice(index, 1)
        }
    }

    $scope.getShift = (shiftId) => {
        var index = $scope.selectedShifts.indexOf(shiftId)
        if (index === -1) {
            $scope.selectedShifts.push(shiftId)
        } else {
            $scope.selectedShifts.splice(index, 1)
        }
    }

    $scope.isShiftSelected = (shiftId) => {
        return $scope.listDoctorShiftsDB.some(function (object) {
            return object[0].shiftId === shiftId
        });
    }

    $scope.isShiftBooked = (shiftId) => {
        return $scope.listDoctorShiftsUnavailabilityDB.some(function (object) {
            return object[0].shiftId === shiftId;
        });
    }

    $scope.isCheduled=(doctorId)=>{
        return $scope.listDoctorScheduleByTimeRangesDB.some(obj=>{
            return obj===doctorId
        })
    }

    $scope.getSlectedDates = (startStr, endStr) => {
        endStr = moment(endStr, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')
        var dateArray = []
        if (startStr != endStr) {
            while (startStr <= endStr) {
                dateArray.push(startStr)
                startStr = moment(startStr, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD')
            }
        } else {
            dateArray.push(startStr)
        }
        console.log("dateArray", dateArray);
        return dateArray
    }

    $scope.processDoctorScheduleAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-from-doctor-schedule-except-deleted').then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    $scope.getDoctorScheduleAllDoctor=() => {
        $http.get(url + '/doctor-schedule-except-deleted').then((response) => {
            $scope.listDoctorScheduleAllDoctorDB=response.data
            console.log("$scope.listDoctorScheduleAllDoctorDB",$scope.listDoctorScheduleAllDoctorDB);
            $timeout(() => {
                if ($.fn.DataTable.isDataTable('#dataTable-list-schedule-by-doctor')) {
                    $('#dataTable-list-schedule-by-doctor').DataTable().clear().destroy();
                }
                $(document).ready(function () {
                    $('#dataTable-list-schedule-by-doctor').DataTable({
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
                    })
                })
            })
        })       
    }

    $scope.getDoctorScheduleShiftsExcludingDeleted = (date, doctorId) => {
        var params = {
            date: date,
            doctorId: doctorId
        }
        $http.get(url + '/get-doctor-shifts-excluding-deleted', { params: params }).then(response => {
            $scope.listDoctorShiftsDB = response.data
            response.data.forEach(item => {
                $scope.selectedShifts.push(item[0].shiftId)
                $scope.originalScheduleIds.push(item[1] + '-' + item[0].shiftId)
            });
        })
    }

    $scope.getDoctorScheduleByTimeRange = (startStr, endStr) => {
        endStr = moment(endStr, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')
        var params = {
            startStr: startStr,
            endStr: endStr
        }
        $http.get(url + '/doctor-schedule-by-time-range', { params: params }).then(response => {
            $scope.listDoctorScheduleByTimeRangesDB = response.data        
        })
    }

    $scope.getDoctorShiftsUnavailabilityExcludingDeleted = (date, doctorId) => {
        var params = {
            date: date,
            doctorId: doctorId
        }
        $http.get(url + '/get-doctor-shifts-unavailability-excluding-deleted', { params: params }).then(response => {
            $scope.listDoctorShiftsUnavailabilityDB = response.data
            response.data.forEach(item => {
                $scope.selectedShiftsUnavailability.push(item[0].shiftId)
                $scope.originalScheduleIdsUnavailability.push(item[1] + '-' + item[0].shiftId)
            });
        })
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

    $scope.processDoctorUnavailabilityByDoctor = (doctorId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability-by-doctor', { params: { doctorId: doctorId } }).then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    $scope.getDateRegisetered = (doctorId) => {
        $scope.processDataDateRegistered(doctorId).then(result => {
            registeredDates = result;
        }).catch(error => {
            console.error('Error getting registered dates:', error);
        })
    }

    $scope.comparasionDate = (selectDate) => {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);
        $scope.validDate = selectDate.getTime() > date.getTime()
    }

    $scope.removeMilliseconds = (dateString) => {
        if (!dateString) return dateString;
        return dateString.replace(/\.\d+/, '');
    }

    $scope.isDoctorUnavailable = (doctorId, date, shiftIds) => {
        return new Promise((resolve, reject) => {
            var filteredResults = null;
            var convertedDate = TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone)
            $scope.processDoctorUnavailabilityByDoctor(doctorId).then(result => {
                filteredResults = result.filter(du => {
                    var dsDateWithoutMillis = $scope.removeMilliseconds(du.date);
                    var convertedDateWithoutMillis = $scope.removeMilliseconds(convertedDate);
                    return dsDateWithoutMillis === convertedDateWithoutMillis
                });
                if (filteredResults && shiftIds && shiftIds.length > 0) {
                    filteredResults = filteredResults.filter(du => shiftIds.includes(du.timeOfShift.shift.shiftId));
                }
                var isDoctorUnavailable = filteredResults && filteredResults.length > 0;
                resolve({ isBooked: isDoctorUnavailable, shiftBooked: filteredResults });
            }).catch(err => {
                reject(err);
            });
        });
    }

    $scope.hasDash = (shiftId) => {
        if (typeof shiftId !== 'string') {
            console.log("typeof shiftId", typeof shiftId);
            return false
        }
        return shiftId.indexOf('-') !== -1
    };

    $scope.generateScheduleArray = (doctorIds, dates, shiftIds) => {
        var scheduleArray = [];
        doctorIds.forEach(doctorId => {
            dates.forEach(date => {
                shiftIds.forEach(shiftId => {
                    var scheduleObject;

                    if ($scope.hasDash(shiftId)) {
                        scheduleObject = {
                            doctorScheduleId: shiftId.split('-')[0],
                            doctorId: doctorId,
                            date: TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone),
                            shiftId: shiftId.split('-')[1],
                            available: true,
                            updateAt: new Date()
                        };
                    } else {
                        scheduleObject = {
                            doctorScheduleId: -1,
                            doctorId: doctorId,
                            date: TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone),
                            shiftId: shiftId,
                            available: true,
                            updateAt: new Date()
                        };
                    }
                    scheduleArray.push(scheduleObject);
                });
            });
        });

        return scheduleArray;
    };

    $scope.createDoctorSchedule = () => {
        var dates = $scope.selectedDates.map(date => moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))
        var dataArrayAdd = $scope.generateScheduleArray($scope.selectedDoctors, dates, $scope.selectedShifts)
        var addPromises = dataArrayAdd.map(dataAdd => {
            var dataAddJSON = angular.toJson(dataAdd);
            return $http.post(url + '/doctor-schedule', dataAddJSON);
        })

        Promise.all(addPromises).then(() => {
            Swal.fire({
                title: "Thành công!",
                html: "Đăng ký lịch làm thành công",
                icon: "success"
            }).then(() => {
                const btnCloseForm = document.getElementById('btnCloseFormRegister')
                btnCloseForm.click()
            });
        }).catch(error => {
            console.log("Có lỗi khi đăng ký lịch làm việc", error);
        });
    }

    $scope.processChangeDoctorSchedule = (selectedDoctors, originalShifts, selectedShifts, selectedDates, isChangeDate) => {
        var changeDate = isChangeDate
        var originalShiftsLenght = originalShifts.length
        var selectedShiftsLenght = selectedShifts.length
        var selectedShiftsString = selectedShifts.map(shift => shift.toString());
        var originalShiftsSplit = originalShifts.map(item => item.split('-')[1].toString())
        var dates = [moment(selectedDates, 'YYYY-MM-DD').format('DD/MM/YYYY')]
        var doctors = [selectedDoctors]
        console.log("selectedDates", selectedDates);

        var addShifts = []
        var deleteShifts = []
        var updateShifts = []

        const findShifts = () => {
            if (originalShiftsLenght > selectedShiftsLenght) {
                deleteShifts = originalShifts.filter(item => {
                    var id = item.split('-')[1]
                    return !selectedShiftsString.includes(id)
                })

                if (changeDate) {
                    updateShifts = originalShifts.filter(item => {
                        var id = item.split('-')[1]
                        return selectedShiftsString.includes(id)
                    })
                }

            } else if (originalShiftsLenght < selectedShiftsLenght) {
                addShifts = selectedShiftsString.filter(item => {
                    return !originalShiftsSplit.includes(item)
                })

                if (changeDate) {
                    updateShifts = originalShifts.filter(item => {
                        var id = item.split('-')[1]
                        return selectedShiftsString.includes(id)
                    })
                }
            }
            console.log("originalShifts", originalShifts);
            console.log("selectedShifts", selectedShifts);
            console.log("addShifts", addShifts);
            console.log("deleteShifts", deleteShifts);
            console.log("updateShifts ", updateShifts);
        };

        findShifts()

        const handleDeletesAndUpdates = (dataArrayDelete, dataArrayUpdate) => {
            var deletePromises = dataArrayDelete.map(dataDel => {
                var dataDelJSON = angular.toJson(dataDel);
                return $http.delete(url + '/soft-delete-doctor-schedule/' + dataDel.doctorScheduleId);
            });

            var updatePromises = dataArrayUpdate.map(dataUpdate => {
                var dataUpdateJSON = angular.toJson(dataUpdate);
                return $http.put(url + '/doctor-schedule/' + dataUpdate.doctorScheduleId, dataUpdateJSON);
            });

            Promise.all(deletePromises).then(() => {
                return Promise.all(updatePromises);
            }).then(() => {
                Swal.fire({
                    title: "Thành công!",
                    html: "Đổi lịch làm thành công",
                    icon: "success"
                }).then(() => {
                    const btnCloseForm = document.getElementById('btnCloseForm')
                    btnCloseForm.click()
                });
            }).catch(error => {
                console.log("Có lỗi khi thay đổi lịch làm việc", error);
            });
        }

        const handleAddsAndUpdates = (dataArrayAdd, dataArrayUpdate) => {
            var addPromises = dataArrayAdd.map(dataAdd => {
                var dataAddJSON = angular.toJson(dataAdd);
                return $http.post(url + '/doctor-schedule', dataAddJSON);
            });

            var updatePromises = dataArrayUpdate.map(dataUpdate => {
                var dataUpdateJSON = angular.toJson(dataUpdate);
                return $http.put(url + '/doctor-schedule/' + dataUpdate.doctorScheduleId, dataUpdateJSON);
            });

            Promise.all(addPromises).then(() => {
                return Promise.all(updatePromises);
            }).then(() => {
                Swal.fire({
                    title: "Thành công!",
                    html: "Đổi lịch làm thành công",
                    icon: "success"
                }).then(() => {
                    const btnCloseForm = document.getElementById('btnCloseForm')
                    btnCloseForm.click()
                });
            }).catch(error => {
                console.log("Có lỗi khi thay đổi lịch làm việc", error);
            });
        }

        if (changeDate) {
            if (originalShiftsLenght > selectedShiftsLenght) {
                var dataArrayDelete = $scope.generateScheduleArray(doctors, dates, deleteShifts)
                var dataArrayUpdate = $scope.generateScheduleArray(doctors, dates, updateShifts)
                handleDeletesAndUpdates(dataArrayDelete, dataArrayUpdate)

            } else if (originalShiftsLenght < selectedShiftsLenght) {
                var dataArrayAdd = $scope.generateScheduleArray(doctors, dates, addShifts)
                var dataArrayUpdate = $scope.generateScheduleArray(doctors, dates, updateShifts)
                handleAddsAndUpdates(dataArrayAdd, dataArrayUpdate)
            }
        } else {
            if (originalShiftsLenght > selectedShiftsLenght) {
                var dataArrayDelete = $scope.generateScheduleArray(doctors, dates, deleteShifts)
                handleDeletesAndUpdates(dataArrayDelete, [])
            } else if (originalShiftsLenght < selectedShiftsLenght) {
                var dataArrayAdd = $scope.generateScheduleArray(doctors, dates, addShifts)
                handleAddsAndUpdates(dataArrayAdd, [])
            }
        }

    }

    $scope.changeDoctorSchedule = async () => {
        if ($scope.selectedDates.length == 0) {
            $scope.selectedDates = moment($('.drgpickerSingle').val(), 'DD/MM/YYYY').format('YYYY-MM-DD')
        }
        var convertOriginalDate = moment($scope.originalDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
        var validChanges = await $scope.isDoctorUnavailable($scope.selectedDoctors, convertOriginalDate, $scope.selectedShifts)

        if (validChanges.isBooked) {
            if ($scope.originalDate !== $scope.selectedDates) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Đổi lịch bị từ chối",
                    html: "Ngày làm việc " + convertOriginalDate + " đã có khách đặt lịch hẹn.",
                    showConfirmButton: false,
                    timer: 3000
                }).then(() => {
                    $('.drgpickerSingle').val(convertOriginalDate)
                    $scope.$apply()
                })
                return
            }
            $scope.processChangeDoctorSchedule($scope.selectedDoctors, $scope.originalScheduleIds, $scope.selectedShifts, $scope.selectedDates, false)
        } else {
            if ($scope.originalDate !== $scope.selectedDates) {
                var checkDate= $scope.getDoctorScheduleShiftsExcludingDeleted($scope.selectedDates, $scope.selectedDoctors)
                console.log("checkDate",checkDate);
                $scope.processChangeDoctorSchedule($scope.selectedDoctors, $scope.originalScheduleIds, $scope.selectedShifts, $scope.selectedDates, true)
            } else {
                $scope.processChangeDoctorSchedule($scope.selectedDoctors, $scope.originalScheduleIds, $scope.selectedShifts, $scope.selectedDates, false)
            }
        }
    }

    $scope.closeForm = () => {
        $route.reload()
    }

    $scope.initializeUIComponents = () => {
        $('.drgpickerSingle').daterangepicker(
            {
                singleDatePicker: true,
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
                    return registeredDates.includes(date.format('YYYY-MM-DD'));
                },
            }
        );
        $('.drgpickerSingle').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = picker.startDate.format('YYYY-MM-DD')
            $scope.selectedDates = selectedDate
        });
    }

    $scope.initializeCalendarRegisterDoctorSchedule = () => {
        $scope.processDoctorScheduleAllDoctor().then(result => {

            console.log("All doctor", result);
            var events = result.map(item => {
                return {
                    title: item[0].fullName,
                    date: `${item[1].split("T")[0]}`,
                    start: `${item[1].split("T")[0]}`,
                    doctor: item[0],
                };
            });

            var calendarEl = document.getElementById('calendar-register-doctor-schedule');
            var calendar = new FullCalendar2.Calendar(calendarEl, {
                timeZone: 'Asia/Ho_Chi_Minh',
                themeSystem: 'bootstrap',
                locale: 'vi',
                buttonText: {
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    list: 'Lịch sử'
                },
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                navLinks: true, // can click day/week names to navigate views
                selectable: true,
                selectMirror: true,
                select: function (arg) {
                    var selectedDate = arg.start.toISOString().split('T')[0];
                    var currentDate = new Date().toISOString().split('T')[0];
                    if (selectedDate <= currentDate) {
                        // Bỏ chọn ngày nếu không hợp lệ
                        calendar.unselect();
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Không thể đăng ký ngày ngày",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        return;
                    }

                    $scope.startDate = TimezoneService.convertToTimezone(arg.start, defaultTimezone)
                    $scope.endDate = moment(TimezoneService.convertToTimezone(arg.end, defaultTimezone)).subtract(1, 'days').format()
                    $scope.$apply();
                    const btnEventDetailsListAppoinment = document.getElementById('btnRegisterDoctorSchedule');
                    btnEventDetailsListAppoinment.click();
                    $scope.selectedDates = $scope.getSlectedDates(arg.startStr, arg.endStr)
                    $scope.getDoctorScheduleByTimeRange(arg.startStr, arg.endStr)
                    calendar.unselect()
                },
                eventClick: function (arg) {
                    console.log("eventClick", arg);
                    $scope.isChangeSchedule = true
                    $scope.formDoctorSchedule.date = moment(arg.event.startStr, 'YYYY-MM-DD').format('DD/MM/YYYY')
                    $scope.formDoctorSchedule.doctorId = arg.event.extendedProps.doctor.doctorId
                    $scope.formDoctorSchedule.fullName = arg.event.extendedProps.doctor.fullName
                    console.log("$scope.formDoctorSchedule.fullName",$scope.formDoctorSchedule.fullName);
                    $scope.selectedDoctors = arg.event.extendedProps.doctor.doctorId
                    $scope.originalDate = arg.event.startStr

                    $scope.comparasionDate(arg.event.startStr)
                    $scope.getDateRegisetered(arg.event.extendedProps.doctor.doctorId)
                    $scope.getDoctorScheduleShiftsExcludingDeleted(arg.event.startStr, arg.event.extendedProps.doctor.doctorId)
                    $scope.getDoctorShiftsUnavailabilityExcludingDeleted(arg.event.startStr, arg.event.extendedProps.doctor.doctorId)
                    $scope.$apply();
                    const btnEventDetailsDoctorSchedule = document.getElementById('btnEventDetailsDoctorSchedule');
                    btnEventDetailsDoctorSchedule.click();
                },
                editable: true,
                dayMaxEvents: true, // allow "more" link when too many events
                events: events,
                eventDidMount: function (info) {
                    var eventDate = info.event.start.toISOString().split('T')[0];
                    var currentDate = new Date().toISOString().split('T')[0];

                    var eventElement = info.el.querySelector('.fc-event-main')
                    var fcEventEl = info.el
                    if (eventDate < currentDate) {
                        eventElement.classList.add('custom-fc-event-main-past')
                        fcEventEl.classList.add('custom-fc-event-past')
                    }
                }
            });
            calendar.render();
        })
    }

    $scope.calculateWorkingHours = (beginTime, endTime) => {
        if (!beginTime || !endTime) return 0;

        const timeToMinutes = (time) => {
            const [hours, minutes, seconds] = time.split(':').map(Number);
            return hours * 60 + minutes + (seconds / 60);
        };

        const beginMinutes = timeToMinutes(beginTime);
        const endMinutes = timeToMinutes(endTime);

        let diffMinutes = endMinutes - beginMinutes;

        if (diffMinutes < 0) {
            diffMinutes += 24 * 60
        }

        const diffHours = diffMinutes / 60
        return diffHours;
    }

    $scope.getListShift()
    $scope.getListDoctor()
    $scope.getDoctorScheduleAllDoctor()
    $scope.initializeCalendarRegisterDoctorSchedule()
    $scope.initializeUIComponents()

});