app.controller('AdminDoctorScheduleController', function ($scope, $http, $rootScope, $location, $timeout, $window, processSelect2Service, TimezoneService, $route,API) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    //code here
    const defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.listDoctorScheduleDB = []
    $scope.listDoctorShiftsDB = []
    $scope.listDoctorShiftsUnavailabilityDB = []
    $scope.listDoctorScheduleByTimeRangesDB = []
    $scope.listDSByTimeRangesDB = []
    let registeredDates = ""
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

    $scope.selectedDateFilterTable = []
    $scope.selectedDoctorFilterTable = []

    $scope.formFilter = {
        filterDate: moment(new Date()).format('DD/MM/YYYY')
    };

    let paramsFiler = {
        startStr: moment(new Date()).format('YYYY-MM-DD'),
        endStr: moment(new Date()).format('YYYY-MM-DD')
    }

    $scope.formDoctorSchedule = {
        doctorScheduleId: -1,
        date: moment().format('DD/MM/YYYY'),
        shiftId: '',
        doctorId: '',
        available: true,
        createAt: new Date(),
        updateAt: '',
        fullName: ''
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
        let index = $scope.selectedDoctors.indexOf(doctorId)
        if (index === -1) {
            $scope.selectedDoctors.push(doctorId)
        } else {
            $scope.selectedDoctors.splice(index, 1)
        }
    }

    $scope.getShift = (shiftId) => {
        let index = $scope.selectedShifts.indexOf(shiftId)
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

    $scope.isCheduled = (doctorId) => {
        let doctorIds = []

        for (let key in $scope.listDoctorScheduleByTimeRangesDB) {
            doctorIds.push(parseInt(key))
        }

        return doctorIds.some(obj => {
            return obj === doctorId
        })

    }

    $scope.detailByShift = (shiftId) => {
        let dsByShift = [];
        for (let key in $scope.listDoctorScheduleByTimeRangesDB) {
            let arr = $scope.listDoctorScheduleByTimeRangesDB[key];

            let filteredArr = arr.filter(ds => {
                return ds.shift && ds.shift.shiftId === shiftId;
            });

            dsByShift = dsByShift.concat(filteredArr);
        }
        return dsByShift;
    }

    $scope.getSlectedDates = (startStr, endStr) => {
        endStr = moment(endStr, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')
        let dateArray = []
        if (startStr != endStr) {
            while (startStr <= endStr) {
                dateArray.push(startStr)
                startStr = moment(startStr, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD')
            }
        } else {
            dateArray.push(startStr)
        }
        return dateArray
    }

    $scope.processDoctorScheduleAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-from-doctor-schedule-except-deleted').then((response) => {
                resolve(response.data)
            }).catch((error) => reject(error))
        })
    }

    $scope.processDataForTable = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-except-deleted').then((response) => {
                let filteredData = response.data
                if ($scope.selectedDateFilterTable.length > 0) {
                    filteredData = filteredData.filter(item => {
                        return $scope.selectedDateFilterTable.includes(moment(item.date).format("YYYY-MM-DD"))
                    })
                }
                if ($scope.selectedDoctorFilterTable.length > 0) {
                    filteredData = filteredData.filter(item => {
                        return $scope.selectedDoctorFilterTable.includes(item.doctor.doctorId);
                    });
                }
                resolve(filteredData)
            }).catch((error) => reject(error))
        })
    }

    $scope.getDoctorScheduleAllDoctor = () => {
        $scope.processDataForTable().then(result => {
            $scope.listDoctorScheduleAllDoctorDB = result
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
                        },
                        "ordering": false,
                    })
                })
            })
        })
    }

    $scope.getDoctorScheduleShiftsExcludingDeleted = (date, doctorId) => {
        let params = {
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


    $scope.getDoctorScheduleByTimeRange = (startStr, endStr, paramsFiler) => {

        let params = {
            startStr: "",
            endStr: ""
        }
        if (!paramsFiler) {
            endStr = moment(endStr, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')

            params = {
                startStr: startStr,
                endStr: endStr
            }
            $http.get(url + '/map-ds-by-time-range', { params: params }).then(response => {
                // click chọn thời gian trên lịch
                $scope.listDoctorScheduleByTimeRangesDB = response.data
            })
        } else {
            params = {
                startStr: paramsFiler.startStr,
                endStr: paramsFiler.endStr
            }
            $http.get(url + '/map-date-ds-by-time-range', { params: params }).then(response => {
                //click chọn ngày để xem thống kê
                $scope.listDSByTimeRangesDB = response.data
                $scope.isShowDetail = Object.keys($scope.listDSByTimeRangesDB).length != 0
                $scope.listDoctorByTimeRange = $scope.getDoctorByTimeRange($scope.listDSByTimeRangesDB)
                $scope.listDoctorByTimeRange.sort((a, b) => b[1] - a[1])
            })
        }
    }

    $scope.getDoctorByTimeRange = (listDSByTimeRangesDB) => {

        let filterData = [];
        let uniqueDoctorIds = [];
        let dsUniqueDoctors = [];
        let result = [];

        for (let key in listDSByTimeRangesDB) {
            filterData = filterData.concat(listDSByTimeRangesDB[key]);
        }

        filterData.forEach(ds => {
            let doctorId = ds.doctor.doctorId + '-' + ds.doctor.fullName;
            if (!uniqueDoctorIds.includes(doctorId)) {
                uniqueDoctorIds.push(doctorId);
            }
            dsUniqueDoctors.push(ds);
        });

        uniqueDoctorIds.forEach(item => {
            let id = item.split('-')[0];

            let filteredDs = dsUniqueDoctors.filter(ds => ds.doctor.doctorId === parseInt(id));

            result.push([item, filteredDs.length]);
        });

        return result;
    }


    $scope.detailByDateSelected = (shiftId, doctorSchedule) => {
        return doctorSchedule.filter(ds => ds.shift.shiftId == shiftId)
    }


    $scope.getDoctorShiftsUnavailabilityExcludingDeleted = (date, doctorId) => {
        let params = {
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
                let dates = response.data
                    .filter(item => item.doctor && item.doctor.doctorId === doctorId && item.deleted == false)
                    .map(item => item.date);
                let disabledDates = dates.filter(date => date !== null)
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
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);
        $scope.validDate = selectDate.getTime() > date.getTime()
        return selectDate.getTime() > date.getTime()
    }

    $scope.removeMilliseconds = (dateString) => {
        if (!dateString) return dateString;
        return dateString.replace(/\.\d+/, '');
    }

    $scope.isDoctorUnavailable = (doctorId, date, shiftIds) => {
        return new Promise((resolve, reject) => {
            let filteredResults = null;
            let convertedDate = TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone)
            $scope.processDoctorUnavailabilityByDoctor(doctorId).then(result => {
                filteredResults = result.filter(du => {
                    let dsDateWithoutMillis = $scope.removeMilliseconds(du.date);
                    let convertedDateWithoutMillis = $scope.removeMilliseconds(convertedDate);
                    return dsDateWithoutMillis === convertedDateWithoutMillis
                });
                if (filteredResults && shiftIds && shiftIds.length > 0) {
                    filteredResults = filteredResults.filter(du => shiftIds.includes(du.timeOfShift.shift.shiftId));
                }
                let isDoctorUnavailable = filteredResults && filteredResults.length > 0;
                resolve({ isBooked: isDoctorUnavailable, shiftBooked: filteredResults });
            }).catch(err => {
                reject(err);
            });
        });
    }

    $scope.hasDash = (shiftId) => {
        if (typeof shiftId !== 'string') {
            return false
        }
        return shiftId.indexOf('-') !== -1
    };

    $scope.generateScheduleArray = (doctorIds, dates, shiftIds) => {
        let scheduleArray = [];
        doctorIds.forEach(doctorId => {
            dates.forEach(date => {
                shiftIds.forEach(shiftId => {
                    let scheduleObject;

                    if ($scope.hasDash(shiftId)) {
                        scheduleObject = {
                            doctorScheduleId: shiftId.split('-')[0],
                            doctorId: doctorId,
                            date: TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone),
                            shiftId: shiftId.split('-')[1],
                            available: true,
                            updateAt: new Date(),
                            createAt: new Date()
                        };
                    } else {
                        scheduleObject = {
                            doctorScheduleId: -1,
                            doctorId: doctorId,
                            date: TimezoneService.convertToTimezone(moment(date, 'DD/MM/YYYY').toDate(), defaultTimezone),
                            shiftId: shiftId,
                            available: true,
                            updateAt: new Date(),
                            createAt: new Date()
                        };
                    }
                    scheduleArray.push(scheduleObject);
                });
            });
        });

        return scheduleArray;
    };

    $scope.createDoctorSchedule = () => {
        let dates = $scope.selectedDates.map(date => moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))
        if ($scope.selectedDoctors.length == 0) {
            Swal.fire({
                title: "Thông báo!",
                html: "Bạn chưa chọn bác sĩ",
                icon: "warning",
            })
            return
        }
        if ($scope.selectedShifts.length == 0) {
            Swal.fire({
                title: "Thông báo!",
                html: "Bạn chưa chọn ca làm việc",
                icon: "warning",
            })
            return
        }
        let dataArrayAdd = $scope.generateScheduleArray($scope.selectedDoctors, dates, $scope.selectedShifts)

        let addPromises = dataArrayAdd.map(dataAdd => {
            let dataAddJSON = angular.toJson(dataAdd);
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

    $scope.processChangeDoctorSchedule = (selectedDoctors, originalShifts, selectedShifts, selectedDates, originalDate, isChangeDate) => {
        let changeDate = isChangeDate
        let originalShiftsLenght = originalShifts.length
        let selectedShiftsLenght = selectedShifts.length
        let selectedShiftsString = selectedShifts.map(shift => shift.toString());
        let originalShiftsSplit = originalShifts.map(item => item.split('-')[1].toString())
        let dates = [moment(selectedDates, 'YYYY-MM-DD').format('DD/MM/YYYY')]
        let oDates = [moment(originalDate, 'YYYY-MM-DD').format('DD/MM/YYYY')]

        let doctors = [selectedDoctors]


        let addShifts = []
        let deleteShifts = []
        let updateShifts = []
        const hasCommonElement = () => {
            return selectedShiftsString.some(shiftId => {
                return originalShiftsSplit.includes(shiftId)
            })
        }

        let checkCondition = hasCommonElement()
        const findShifts = () => {
            if (!checkCondition || originalShiftsLenght == selectedShiftsLenght) {
                deleteShifts = originalShifts
                addShifts = selectedShifts
            } else {
                if (originalShiftsLenght > selectedShiftsLenght) {
                    deleteShifts = originalShifts.filter(item => {
                        let id = item.split('-')[1]
                        return !selectedShiftsString.includes(id)
                    })

                    if (changeDate) {
                        updateShifts = originalShifts.filter(item => {
                            let id = item.split('-')[1]
                            return selectedShiftsString.includes(id)
                        })
                    }

                } else if (originalShiftsLenght < selectedShiftsLenght) {
                    addShifts = selectedShiftsString.filter(item => {
                        return !originalShiftsSplit.includes(item)
                    })

                    if (changeDate) {
                        updateShifts = originalShifts.filter(item => {
                            let id = item.split('-')[1]
                            return selectedShiftsString.includes(id)
                        })
                    }
                }
            }

        };

        findShifts()

        const handleDeletesAndUpdates = (dataArrayDelete, dataArrayUpdate) => {
            let deletePromises = dataArrayDelete.map(dataDel => {
                let dataDelJSON = angular.toJson(dataDel);
                return $http.delete(url + '/soft-delete-doctor-schedule/' + dataDel.doctorScheduleId);
            });

            let updatePromises = dataArrayUpdate.map(dataUpdate => {
                let dataUpdateJSON = angular.toJson(dataUpdate);
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
            let addPromises = dataArrayAdd.map(dataAdd => {
                let dataAddJSON = angular.toJson(dataAdd);
                return $http.post(url + '/doctor-schedule', dataAddJSON);
            });

            let updatePromises = dataArrayUpdate.map(dataUpdate => {
                let dataUpdateJSON = angular.toJson(dataUpdate);
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

        const handleAddsAndDelete = (dataArrayAdd, dataArrayDelete) => {
            let addPromises = dataArrayAdd.map(dataAdd => {
                let dataAddJSON = angular.toJson(dataAdd);
                return $http.post(url + '/doctor-schedule', dataAddJSON);
            });

            let deletePromises = dataArrayDelete.map(dataDel => {
                let dataDelJSON = angular.toJson(dataDel);
                return $http.delete(url + '/soft-delete-doctor-schedule/' + dataDel.doctorScheduleId);
            });

            Promise.all(addPromises).then(() => {
                return Promise.all(deletePromises);
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
            if (!checkCondition || originalShiftsLenght == selectedShiftsLenght) {
                let dataArrayDelete = $scope.generateScheduleArray(doctors, oDates, deleteShifts)
                let dataArrayAdd = $scope.generateScheduleArray(doctors, dates, addShifts)
                handleAddsAndDelete(dataArrayAdd, dataArrayDelete)
            } else {
                if (originalShiftsLenght > selectedShiftsLenght) {
                    let dataArrayDelete = $scope.generateScheduleArray(doctors, oDates, deleteShifts)
                    let dataArrayUpdate = $scope.generateScheduleArray(doctors, dates, updateShifts)
                    handleDeletesAndUpdates(dataArrayDelete, dataArrayUpdate)
                } else if (originalShiftsLenght < selectedShiftsLenght) {
                    let dataArrayAdd = $scope.generateScheduleArray(doctors, dates, addShifts)
                    let dataArrayUpdate = $scope.generateScheduleArray(doctors, dates, updateShifts)
                    handleAddsAndUpdates(dataArrayAdd, dataArrayUpdate)
                }
            }
        } else {       
            if (!checkCondition || originalShiftsLenght == selectedShiftsLenght) {
                let dataArrayDelete = $scope.generateScheduleArray(doctors, oDates, deleteShifts)
                let dataArrayAdd = $scope.generateScheduleArray(doctors, dates, addShifts)
                handleAddsAndDelete(dataArrayAdd, dataArrayDelete)
            } else {
                if (originalShiftsLenght > selectedShiftsLenght) {
                    let dataArrayDelete = $scope.generateScheduleArray(doctors, dates, deleteShifts)
                    handleDeletesAndUpdates(dataArrayDelete, [])
                } else if (originalShiftsLenght < selectedShiftsLenght) {
                    let dataArrayAdd = $scope.generateScheduleArray(doctors, dates, addShifts)
                    handleAddsAndUpdates(dataArrayAdd, [])
                }
            }

        }

    }

    $scope.editSchedule = (ds) => {
        $scope.isChangeSchedule = true
        $scope.formDoctorSchedule.date = moment(ds.date, 'YYYY-MM-DD').format('DD/MM/YYYY')
        $scope.formDoctorSchedule.doctorId = ds.doctor.doctorId
        $scope.formDoctorSchedule.fullName = ds.doctor.fullName
        $scope.selectedDoctors = ds.doctor.doctorId
        $scope.originalDate = ds.date.split('T')[0]

        $scope.comparasionDate(ds.date.split('T')[0])
        $scope.getDateRegisetered(ds.doctor.doctorId)
        $scope.getDoctorScheduleShiftsExcludingDeleted(ds.date.split('T')[0], ds.doctor.doctorId)
        $scope.getDoctorShiftsUnavailabilityExcludingDeleted(ds.date.split('T')[0], ds.doctor.doctorId)

        const btnEventDetailsDoctorSchedule = document.getElementById('btnEventDetailsDoctorSchedule');
        btnEventDetailsDoctorSchedule.click();
    }

    $scope.changeDoctorSchedule = async () => {

        if ($scope.selectedDates.length == 0) {
            $scope.selectedDates = moment($('.drgpickerSingle').val(), 'DD/MM/YYYY').format('YYYY-MM-DD')
        }
        let convertOriginalDate = moment($scope.originalDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
        let validChanges = await $scope.isDoctorUnavailable($scope.selectedDoctors, convertOriginalDate, $scope.selectedShifts)

        let isChangeDate = false
     
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
            $scope.processChangeDoctorSchedule($scope.selectedDoctors, $scope.originalScheduleIds, $scope.selectedShifts, $scope.selectedDates, $scope.originalDate, isChangeDate)
        } else {
            if ($scope.originalDate !== $scope.selectedDates) {
                isChangeDate = true
                $scope.processChangeDoctorSchedule($scope.selectedDoctors, $scope.originalScheduleIds, $scope.selectedShifts, $scope.selectedDates, $scope.originalDate, isChangeDate)
            } else {
                $scope.processChangeDoctorSchedule($scope.selectedDoctors, $scope.originalScheduleIds, $scope.selectedShifts, $scope.selectedDates, $scope.originalDate, isChangeDate)
            }
        }
    }

    $scope.closeForm = () => {
        $route.reload()
    }

    $scope.closeModalAndNavigate = () => {
        let btnCloseForm = document.getElementById('btn-close-form')
        btnCloseForm.click()
        // Chuyển route
        $location.path('/admin/doctor');
        $scope.$apply();
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
            let selectedDate = picker.startDate.format('YYYY-MM-DD')
            $scope.selectedDates = selectedDate
        });

        $('.drgpicker-filter').daterangepicker(
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

            });

        $('.drgpicker-filter').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = $('#drgpicker-filter').val();
            let paramsFiler = {
                startStr: moment(selectedDate.split(' - ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
                endStr: moment(selectedDate.split(' - ')[1], 'DD/MM/YYYY').format('YYYY-MM-DD')
            }
            $scope.getDoctorScheduleByTimeRange("", "", paramsFiler)
        });

        $('.drgpicker-table-filter').daterangepicker(
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
            }
        );
        $('.drgpicker-table-filter').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = $('#dateFilterTableDs').val();
            $scope.getDateFilter(selectedDate)
        });

        $('.select2-multi').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });

        $('#doctorFilterTableDs').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#doctorFilterTableDs').val()
                $scope.selectedDoctorFilterTable = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getDoctorScheduleAllDoctor()
            });
        });
    }

    $scope.initializeCalendarRegisterDoctorSchedule = () => {
        $scope.processDoctorScheduleAllDoctor().then(result => {
            let events = result.map(item => {
                return {
                    title: item[0].fullName,
                    date: `${item[1].split("T")[0]}`,
                    start: `${item[1].split("T")[0]}`,
                    doctor: item[0],
                };
            });

            let calendarEl = document.getElementById('calendar-register-doctor-schedule');
            let calendar = new FullCalendar2.Calendar(calendarEl, {
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
                    right: 'dayGridMonth'
                    // ,timeGridWeek,timeGridDay
                },
                navLinks: true,
                selectable: true,
                selectMirror: true,
                select: function (arg) {
                    let selectedDate = arg.start.toISOString().split('T')[0];
                    let currentDate = new Date().toISOString().split('T')[0];
                    if (selectedDate <= currentDate) {
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
                    $scope.selectedDates = $scope.getSlectedDates(arg.startStr, arg.endStr)
                    $scope.getDoctorScheduleByTimeRange(arg.startStr, arg.endStr, null)
                    const btnEventDetailsListAppoinment = document.getElementById('btnRegisterDoctorSchedule');
                    btnEventDetailsListAppoinment.click();

                    calendar.unselect()
                },
                eventClick: function (arg) {
                    $scope.isChangeSchedule = true
                    $scope.formDoctorSchedule.date = moment(arg.event.startStr, 'YYYY-MM-DD').format('DD/MM/YYYY')
                    $scope.formDoctorSchedule.doctorId = arg.event.extendedProps.doctor.doctorId
                    $scope.formDoctorSchedule.fullName = arg.event.extendedProps.doctor.fullName
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
                dayMaxEvents: true,
                events: events,
                eventDidMount: function (info) {
                    let eventDate = info.event.start.toISOString().split('T')[0];
                    let currentDate = new Date().toISOString().split('T')[0];

                    let eventElement = info.el.querySelector('.fc-event-main')
                    let fcEventEl = info.el
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

    $scope.refreshFilter = () => {
        $route.reload()
    }

    $scope.getDateFilter = (selectedDate) => {
        $scope.selectedDateFilterTable = [];
        let dates = selectedDate.split(' - ');
        let fromDate = moment(dates[0], 'DD/MM/YYYY');
        let toDate = moment(dates[1], 'DD/MM/YYYY');
        while (fromDate <= toDate) {
            $scope.selectedDateFilterTable.push(moment(fromDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
            fromDate = fromDate.add(1, 'days');
        }
        $scope.getDoctorScheduleAllDoctor();
    }

    $scope.urlImgDoctor = (filename) => {
        return url+"/imgDoctor/" + filename;
    }

    $scope.getListShift()
    $scope.getListDoctor()
    $scope.getDoctorScheduleAllDoctor()
    $scope.getDoctorScheduleByTimeRange("", "", paramsFiler)
    $scope.initializeCalendarRegisterDoctorSchedule()
    $scope.initializeUIComponents()


});