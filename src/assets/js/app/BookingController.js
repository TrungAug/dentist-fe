app.controller('BookingController', function ($scope, $http, $rootScope, $location, $timeout,API) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.doctorId = -1;
    var specialtyId = 0;
    $scope.symtomTrue = false;
    $scope.selectedShiftHour = [];
    $scope.foundServices = []
    $scope.daySelected = "";
    $scope.issueIds = [];
    $scope.showConfirmForm = true;
    $scope.listDoctorUnavailabilityByDoctorDB = [];
    $scope.listDoctorScheduleByDate = []
    $scope.selectAll = false;
    $scope.selectAllEnable = true;
    $scope.isEnoughHour = false;
    $scope.totalPrice = 0;
    $scope.totalTime = 0;
    $scope.hasSelectedService = false; // Biến để kiểm tra xem có dịch vụ nào được chọn
    $scope.hourSelected = []
    $scope.showConfirmAppointmentModal = false
    $scope.hourLenghtSelected = 0;
    function normalizeVietnameseString(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }
    // Hàm loại bỏ các phần tử trùng lặp
    $scope.dutyDays = [];

    $scope.init = function (){
            $('.select2-multi').select2({
                multiple: true,
                theme: 'bootstrap4',
            })
            $('#formSymptom').on('change', function () {
                $timeout(function () {
                    $scope.loadTreatmeantAndServiceByIssue()
                 });
              });
              
            $('#formShiftHour').on('change', function () {
            $timeout(function () {
                $scope.loadEnoughHour()
                });
            });
    }

    $scope.formValidateColor = function() {
        var form = document.getElementById('appointmentForm');
        var isVal = form.checkValidity()
        var shiftClass = document.getElementById("formShift").classList;
        var shiftHourClass = document.getElementById("formShiftHour").classList;
        var shiftHour = document.getElementById("formShiftHour-feedback");
        var shift = document.getElementById("formShift-feedback");
        
        if ($scope.issueIds.length === 0) {
            var firstElement = document.querySelector('.select2-selection.select2-selection--multiple');
            if (firstElement) {
                firstElement.style.borderColor = '#dc3545';
            }
            $scope.symtomTrue = true;
            isVal = false;
            return isVal;
        } else {
            var firstElement = document.querySelector('.select2-selection.select2-selection--multiple');
            if (firstElement) {
                firstElement.style.borderColor = '#3ad29f';
            }
            isVal = true;
            $scope.symtomTrue = false;
        }
        var selectedShiftHour = $('#formShiftHour').val();
        var formShiftHourElement = document.getElementById('formShiftHour');
        $scope.hourSelected = []
        console.log(selectedShiftHour)
        if (selectedShiftHour.length === 0) {
            formShiftHourElement.classList.remove('ng-valid');
            formShiftHourElement.classList.add('ng-invalid');
            
            isVal = false;
            return isVal;
        } else {
            formShiftHourElement.classList.remove('ng-invalid');
            formShiftHourElement.classList.add('ng-valid');
            selectedShiftHour.forEach( sh => {
                $scope.hourSelected.push($scope.listTimeOfShifts.find(list => list.timeOfShiftId == sh))
            })
            console.log($scope.hourSelected)
            isVal = true;
        }
        
        if (shiftClass.contains('ng-invalid')) {

            shift.classList.remove("ng-hide");
            isVal = false;
            return isVal;
        }else{
            shift.classList.add("ng-hide");
            isVal = true;
            
        }
        if (shiftHourClass.contains('ng-invalid')) {
            shiftHour.classList.remove("ng-hide");
            isVal = false;
            return isVal;
        }else{
            shiftHour.classList.add("ng-hide");
            isVal = true;
        }
        return isVal;
    }
    $scope.isCorrectBookingHoour  = function() {
        var sortedShifts = $scope.hourSelected.slice().sort(function(a, b) {
            return a.timeOfShiftId - b.timeOfShiftId;
        });
    
        // Kiểm tra tính liên tiếp
        for (var i = 0; i < sortedShifts.length - 1; i++) {
            if (sortedShifts[i + 1].timeOfShiftId !== sortedShifts[i].timeOfShiftId + 1) {
               
                return false; // Không liên tiếp
            }
        }
        return true;
    }
    $scope.showConfirmModal = function() {
        var isCorrectForm = $scope.formValidateColor();
        if (isCorrectForm) {
            console.log($scope.getRecommendation())

            if($scope.hourLenghtSelected != $scope.getRecommendation()){
                Swal.fire({
                    title: "Thất bại!",
                    html: "Số ca quý khách chọn còn thiếu!",
                    icon: "error"
                });
                return false;
            }
            if(!$scope.isCorrectBookingHoour()){
                Swal.fire({
                    title: "Thất bại!",
                    html: "Quý khách cần chọn giờ liên tiếp tránh dịch vụ bị gián đoạn!",
                    icon: "error"
                });
                return false;
            }

            if ($scope.hourSelected.length < $scope.getRecommendation()) {
                $scope.showConfirmAppointmentModal = true
                $scope.showConfirmForm = false
            }else{
                $scope.showConfirmAppointmentModal = false
                $scope.showConfirmForm = false
            }
        } else {
            // Hiển thị lỗi cho các trường không hợp lệ
            $scope.showConfirmForm = true;
            document.getElementById('appointmentForm').classList.add('was-validated');
            console.log("Form is invalid, please check the required fields.");
        }
    }
    $scope.confirmContinueAppointment = function(isContinue) {
            if(isContinue){
                $scope.showConfirmForm = false
            }else{
                $scope.showConfirmForm = true
            }
    }
    $scope.confirmSaveAppointment = function() {
         // Ngày đã chọn từ date picker của bạn
        var dateSelected = $scope.daySelected; 
        var patient = $scope.patientLogged;
        var dateDoctorUnavailability = new Date(dateSelected);
        var appointmentTypeId = 1; // Giá trị của appointment_TypeId bạn muốn tìm
        // Lấy appointmentType
        
        var appointmentTypeSelected = $scope.listAppointmentTypeDB.find(function(appointmentType) {
            return appointmentType.appointment_TypeId === appointmentTypeId;
        }); 
        // Lấy appointmentStatus
        var appointmentStatusId = 1; // Giá trị của appointment_TypeId bạn muốn tìm
        var appointmentStatusSelected = $scope.listAppointmentStatusDB.find(function(appointmentStatus) {
            return appointmentStatus.appointment_StatusId === appointmentStatusId;
        });
        // Tạo bảng Appointment
        // Tạo hồ sơ khám
        var appointmentPatientRecordData = {
            createAt: new Date(),
            currentCondition: null, // Tình trạng hiện tại 
            reExamination: null, // Tái khám
            isDeleted: false,
            patientId: patient.patientId // Liên kết với ID của bệnh nhân
        };
        
        // Gửi yêu cầu POST để thêm dữ liệu vào bảng appointmentPatientRecord
        $http.post(url + '/appointment-patient-record', appointmentPatientRecordData, { headers: headers }).then(response => {
            // console.log("Lưu AppointmentPatientRecord thành công!");
            var createdAppointmentPatientRecord = response.data; // Lấy đối tượng appointmentPatientRecord vừa được tạo từ phản hồi của server
    
            // Tạo bản ghi appointment sau khi đã có ID của appointmentPatientRecord
            var appointmentRequestData = {
                createAt: new Date(), // Lấy thời gian hiện tại
                note: $scope.formAppointmentRequestNote, // Lấy ghi chú từ form bên Angular
                appointmentDate: $scope.daySelected, // Lấy ngày đã chọn khi click
                appointmentType: appointmentTypeSelected ? appointmentTypeSelected.appointment_TypeId : null, // Thêm giá trị phù hợp nếu cần thiết
                appointmentStatus: appointmentStatusSelected ? appointmentStatusSelected.appointment_StatusId : null,
                appointmentPatientRecord: createdAppointmentPatientRecord.appointmentPatientRecordId, // Liên kết với ID của appointmentPatientRecord vừa được tạo
                dentalStaffId: null, // Bệnh nhân tự đặt hẹn thì không có nhân viên
                doctorId: $scope.doctorId,
                patientId: patient.patientId,
                isDeleted: false
            };
    
            $http.post(url + '/appointment', appointmentRequestData, { headers: headers }).then(response => {
                var createdAppointment = response.data;

                $scope.hourSelected.forEach ( hr => {
                    console.log(hr.timeOfShiftId)
                    var hourSelected = hr.beginTime; // Giả sử bạn lấy giờ bắt đầu từ selectedShiftHour
                    // Kết hợp ngày và giờ thành đối tượng dateDoctorUnavailability
                    var hourParts = hourSelected.split(':');
                    dateDoctorUnavailability.setHours(hourParts[0], hourParts[1], 0, 0);
                    //Tạo lịch bận cho bác sĩ
                    var doctorUnavailabilityData = { 
                        description: "Bận",
                        isDeleted: false,
                        date: dateDoctorUnavailability,
                        timeOfShiftId: hr.timeOfShiftId,
                        appointmentId: createdAppointment.appointmentId
                    };
                    console.log(doctorUnavailabilityData);
                    // console.log($scope.selectedShift.shift.shiftId);
                    $http.post(url + '/doctorUnavailability', doctorUnavailabilityData, { headers: headers }).then(response => {
                        $scope.showConfirmForm = true;
                    }).catch(error => {
                        console.error('Error fetching doctor schedule:', error);
                        // console.log(doctorUnavailabilityData);
                        $scope.showConfirmForm = true;
                    })
                })
                Swal.fire({
                    title: "Thành công!",
                    html: "Hẹn lịch với bác sĩ thành công!",
                    icon: "success"
                });
                $scope.resetForm()
            }).catch(error => {
                $scope.showConfirmForm = true;
                console.log("Lưu Appointment thất bại!", error);
            });
        }).catch(error => {
            $scope.showConfirmForm = true;
            console.log("Lưu AppointmentPatientRecord thất bại!", error);
        });
    };
    
    $scope.loadTreatmeantAndServiceByIssue = function() {
        // console.log($scope.foundServices.length);
        



        // Lấy các triệu chứng đã chọn từ select2
        var selectedIssues = $('#formSymptom').val();
        // console.log("Selected issues from select2:", selectedIssues);

        // Đảm bảo selectedIssuesForm là một mảng và reset lại mảng
        $scope.selectedIssuesForm = []
        selectedIssues.forEach(iss => {
            // Tìm đối tượng cần thêm từ danh sách database
            let issueToAdd = $scope.listDentalIssuesDB.find(issSel => issSel.dentalIssuesId == iss);

            // Nếu tìm thấy đối tượng, thêm vào mảng selectedIssuesForm
            if (issueToAdd) {
                $scope.selectedIssuesForm.push(issueToAdd);
                // console.log("Đã thêm triệu chứng: ", issueToAdd);
            } else {
                // console.log("Không tìm thấy triệu chứng với ID: ", iss);
            }
        });
        $scope.selectedIssuesString = $scope.selectedIssuesForm.map(issue => issue.name).join(', ');
        // Kiểm tra lại danh sách triệu chứng đã được thêm
        // console.log("Danh sách triệu chứng đã được thêm: ", $scope.selectedIssuesString);

        
        
       

        $scope.issueIds = selectedIssues.map(id => parseInt(id));
        if($scope.issueIds != []){
            $scope.selectAllEnable = true;
        }else{
            $scope.selectAllEnable = false;
        }
    
        // Tìm các điều trị tương ứng với các vấn đề đã chọn
        $scope.foundTreatments = $scope.issueIds.flatMap(issueId => 
            $scope.listIssuesTreatmentAutomationDB.filter(list => list.dentalIssues.dentalIssuesId === issueId)
        );
    
        $scope.foundTreatments = $scope.foundTreatments.filter(treatment => treatment.treatment !== null);
        // console.log("Found issues:", $scope.selectedIssuesForm);
        
        // Tìm các dịch vụ tương ứng với các điều trị đã tìm được
        $scope.foundServices = $scope.foundTreatments.flatMap(treatment => 
            $scope.listServiceTreatmentAutomationDB.filter(list => list.treatment.treatmentId === treatment.treatment.treatmentId)
        );
    
        // Loại bỏ các dịch vụ trùng lặp
        let uniqueServices = {};
        $scope.foundServices.forEach(service => {
            if (service.service && service.service.serviceId && !uniqueServices[service.service.serviceId]) {
                uniqueServices[service.service.serviceId] = service;
            }
        });
    
        // Chuyển đối tượng uniqueServices thành mảng
        $scope.foundServices = Object.values(uniqueServices);
    
        // Sắp xếp dịch vụ theo giá tiền
        $scope.foundServices.sort((a, b) => {
            return a.service.price - b.service.price;
        });
        $scope.formValidateColor()
        // console.log("Found services:", $scope.foundServices);
    };
    
    $scope.getListDoctorScheduleByDate = function(date) {
        var formattedDate = new Date(date).toISOString().split('T')[0];  // Ensure date is in yyyy-MM-dd format
        var params = { date: formattedDate };  // Wrap date in an object with key 'date'
        // // console.log('Calling API with params:', params);  // Log params to verify
        return $http.get(url + '/doctor-schedule-by-date', { params: params }).then(response => {
            $scope.listDoctorScheduleByDate = response.data;
            return response.data;  // Ensure the promise resolves with the response data
        }).catch(error => {
            console.error('Error fetching doctor schedule:', error);
            $scope.listDoctorScheduleByDate = [];  // Reset data on error
            return [];  // Ensure the promise resolves with an empty array on error
        });
    };
    $scope.getTreatmentNamesString = function() {
            if ($scope.foundTreatments && $scope.foundTreatments.length > 0) {
                return $scope.foundTreatments.map(function(treatment) {
                    return treatment.treatment.treatmentName;
                }).join(', ');
            } else {
                return '';
            }
    }
    $scope.getListDentalStaff = function () {
        $http.get(url + '/dental-staff-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalStaffDB = response.data;
        });
    }
    $scope.getListAppointmentType = function () {
        $http.get(url + '/appointment-type-except-deleted', { headers: headers }).then(response => {
            $scope.listAppointmentTypeDB = response.data;
            console.log($scope.listAppointmentTypeDB)
        });
    }
    $scope.getListAppointmentStatus = function () {
        $http.get(url + '/appointment-status-except-deleted', { headers: headers }).then(response => {
            $scope.listAppointmentStatusDB = response.data;
        });
    }
    $scope.getListAppointmentPatientRecord = function () {
        $http.get(url + '/appointment-patient-record-except-deleted', { headers: headers }).then(response => {
            $scope.listAppointmentPatientRecordDB = response.data;
        });
    }

    $scope.getListIssuesTreatmentAutomation = function () {
        $http.get(url + '/issues-treatment-automation-except-deleted', { headers: headers }).then(response => {
            $scope.listIssuesTreatmentAutomationDB = response.data;
            // // console.log('API getListIssuesTreatmentAutomation response:', response.data); 
        });
    }
    $scope.getListServiceTreatmentAutomation = function () {
        $http.get(url + '/service-treatment-except-deleted', { headers: headers }).then(response => {
            $scope.listServiceTreatmentAutomationDB = response.data;
            // // console.log('API getListServiceTreatmentAutomation response:', $scope.listServiceTreatmentAutomationDB); 
        });
    }
    $scope.getListDentalIssues = function () {
        $http.get(url + '/dental-issues', { headers: headers }).then(response => {
            $scope.listDentalIssuesDB = response.data;
           
            // Sắp xếp danh sách theo thuộc tính name sau khi đã chuẩn hóa
            $scope.listDentalIssuesDB.sort((a, b) => {
                let nameA = normalizeVietnameseString(a.name);
                let nameB = normalizeVietnameseString(b.name);

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            
            // // console.log('API getListDentalIssues response:', $scope.listDentalIssuesDB); 
        });
    };

    $scope.getListService = function () {
        $http.get(url + '/service-except-deleted', { headers: headers }).then(response => {
            $scope.listServiceDB = response.data;
            // // console.log('API getListService response:', response.data); 
        });
    }
    $scope.getListTreatment = function () {
        $http.get(url + '/treatment', { headers: headers }).then(response => {
            $scope.listTreatmentDB = response.data;
    
            // Sắp xếp danh sách theo thuộc tính treatmentName
            $scope.listTreatmentDB.sort((a, b) => {
                let nameA = normalizeVietnameseString(a.treatmentName); // chuyển đổi tất cả sang chữ hoa
                let nameB = normalizeVietnameseString(b.treatmentName); // chuyển đổi tất cả sang chữ hoa
    
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
    
            // // console.log('Sorted getListTreatment:', $scope.listTreatmentDB); 
        }).catch(error => {
            console.error('API error:', error);
        });
    };
    
    //Lấy bệnh nhân
    $scope.getPatientById = function (patientId) {
        $http.get(url + '/patient-id/' + patientId, { headers: headers }).then(response => {
            $scope.patientLogged = response.data;
        });
    }
    $scope.getListSpecialty = function () {
        $http.get(url + '/specialty', { headers: headers }).then(response => {
            $scope.listSpecialtyDB = response.data;
        });
    }
    $scope.getListDoctor = function () {
        $http.get(url + '/doctor', { headers: headers }).then(response => {
            $scope.listDoctorsDB = response.data;
            // console.log($scope.listDoctorsDB)
        });
    }
    $scope.getListDoctorUnavailabilityByDoctor = function () {
        $http.get(url + '/doctorUnavailability-by-doctor', { params: { doctorId: $scope.doctorId } }).then(response => {
            $scope.listDoctorUnavailabilityByDoctorDB = response.data;
            // // console.log(response.data)
        }).catch(error => {
            console.error('Error fetching doctor unavailability:', error);
            $scope.listDoctorUnavailabilityByDoctorDB = []; // Đặt lại danh sách nếu có lỗi
        });
    };

    $scope.getListShift = function () {
        $http.get(url + '/shift', { headers: headers }).then(response => {
            // // console.log(response.data); 
            $scope.listShifts = response.data;
        });
    }
    $scope.getListTimeOfShift = function () {
        $http.get(url + '/time-of-shift', { headers: headers }).then(response => {
            console.log(response.data)
            $scope.listTimeOfShifts = response.data;
        });
    }

    $scope.loadShiftHours = function() {
        var selectedOption = document.getElementById('formShift').options[document.getElementById('formShift').selectedIndex];
        var selectedLabel = selectedOption.text;
    
        if ($scope.doctorId != -1) {
            // console.log($scope.listDoctorUnavailabilityByDoctorDB);
    
            var selectedShift = $scope.listShifts.find(shift => shift.name === selectedLabel);
            
            if (selectedShift) {
                var shiftId = selectedShift.shiftId;
                
                if (shiftId) {
                    $http.get(url + '/time-of-shift-by-shift-id/' + shiftId, { headers: headers }).then(response => {
                        $scope.listShiftHours = response.data;
    
                        console.log($scope.listShiftHours);
    
                        // Filter listShiftHours to remove items with timeOfShiftId in listDoctorUnavailabilityByDoctorDB
                        $scope.listShiftHours = $scope.listShiftHours.filter(hour => {
                            // Check if this hour's timeOfShiftId exists in listDoctorUnavailabilityByDoctorDB
                            return !$scope.listDoctorUnavailabilityByDoctorDB.some(avail => avail.timeOfShift.timeOfShiftId === hour.timeOfShiftId);
                        });
    
                        // console.log($scope.listShiftHours);
    
                    }).catch(error => {
                        // console.log("Error fetching time of shift: " + error);
                        $scope.listShiftHours = [];
                    });
                } else {
                    // console.log("Không lấy được Id");
                    $scope.listShiftHours = []; // Nếu không có ca làm việc được chọn, xóa danh sách giờ làm việc
                }
                $scope.selectedShiftHour = null; // Đặt lại giá trị giờ làm việc được chọn
            } else {
                // console.log("Không tìm thấy ca làm việc tương ứng");
            }
        }
    };
    
    $scope.getFreeShiftOfDoctor = (shiftId, dateSelected, doctorId) => {
        var params = { 
            shiftId: shiftId,
            date: dateSelected,
            doctorId: doctorId
        }
        return $http.get(url + '/time-of-shift-available', { params: params }).then(response => {
            return $scope.listFreeShiftOfDoctorDB = response.data;

        }).catch(error => {
            // console.log("Error: " + error)
            return []
        })
    }

    $scope.formBookingFill = (doctorId, dateValue) => {
        // Tìm đối tượng bác sĩ theo doctorId trong danh sách
        const doctor = $scope.listDoctorsDB.find(doc => doc.doctorId === doctorId);
        if (doctor) {
            // Điền thông tin vào form
            $scope.dateChosen = dateValue;
        } else {
            // console.log(`Không tìm thấy bác sĩ với doctorId ${doctorId}`);
        }   
    };

    $scope.getListShiftOfDoctorOnMonth = () => {
        // Chọn thẻ <h2> bên trong thẻ có class fc-center
        var headingElement = document.querySelector('.fc-toolbar-title');
        if (headingElement) {
            var headingText = headingElement.textContent || headingElement.innerText;

            // Giả sử nội dung văn bản là "tháng 6 năm 2024" hoặc "tháng 10 năm 2024"
            // Tách chuỗi để lấy tháng và năm
            var parts = headingText.split(' ');
            var month = "";
            var year = "";
            // Kiểm tra cấu trúc của parts để đảm bảo độ dài và giá trị hợp lý
            if (parts.length === 4 && parts[0] === 'tháng' && parts[2] === 'năm') {
                month = parts[1]; // Lấy giá trị tháng
                year = parts[3];  // Lấy giá trị năm

                // Kiểm tra và chuyển đổi tháng và năm sang số nguyên nếu cần thiết
                month = parseInt(month, 10);
                year = parseInt(year, 10);

                // Bây giờ bạn có thể sử dụng biến month và year để xử lý
            } else {
                // console.log('Định dạng văn bản không đúng');
            }
        } else {
            // console.log('Không tìm thấy thẻ <h2> bên trong thẻ có class fc-center');
        }

        if(month == "" || year == ""){
            Swal.fire({
                title: "Lỗi!",
                html: "Không có dữ liệu lịch làm của bác sĩ theo tháng!",
                icon: "danger"
            })
            return false;
        }
        
        var params = {
            doctorId: $scope.doctorId,
            month: month,
            year: year
        }
        // console.log(params)
        $http.get(url + '/time-of-shift-available-by-month', { params: params }).then(response => {
            $scope.listFreeShiftOfDoctorDB = response.data;
             // Khởi tạo lại mảng dutyDays
            $scope.listFreeShiftOfDoctorDB.forEach(function(shift) {
                // Kiểm tra nếu mảng không rỗng và có phần tử đầu tiên
                if (shift.length > 0 && shift[0].date) {
                    var dateTime = shift[0].date;
                    var date = dateTime.split('T')[0]; // Lấy phần YYYY-MM-DD từ chuỗi datetime
        
                    // Kiểm tra nếu ngày chưa có trong mảng dutyDays
                    if (!$scope.dutyDays.includes(date)) {
                        $scope.dutyDays.push(date); // Thêm ngày vào mảng
                    }
                } else {
                    // console.log("No date available in shift.");
                }
            });
            // Thêm class .fc-able cho các thẻ có data-date trùng với bất kỳ dữ liệu trong mảng dutyDays
            document.querySelectorAll('[data-date]').forEach(function(element) {
                var date = element.getAttribute('data-date');
                if ($scope.dutyDays.includes(date) && !element.classList.contains('fc-day-past')) {
                    element.classList.add('fc-able');
                }   
                if (element.classList.contains('fc-day-past') && !element.classList.contains('fc-able') && !element.classList.contains('fc-day-other')) {
                    element.classList.add('fc-unavailable');
                }
                if (element.classList.contains('fc-day-future') && !element.classList.contains('fc-able') && !element.classList.contains('fc-day-other')) {
                    element.classList.add('fc-unavailable');
                }
                // if (element.classList.contains('fc-day-past') && element.classList.contains('fc-past') ) {
                //     element.classList.remove('fc-able');  // Remove fc-able class if present
                // }
                
            });
        }).catch(error => {
            // console.log("Error: " + error);
            return false;
        });
    }
    
    $scope.selectSpecialty = function(specialtyId) {
        $scope.selectedSpecialtyId = specialtyId; 
        if(specialtyId != 0){
            // console.log("Selected Specialty ID:", specialtyId);
            $http.get(url + '/doctor-specialty/' + specialtyId, { headers: headers }).then(response => {
            $scope.listDoctorsDB = response.data;
        });
        }else{
            $http.get(url + '/doctor', { headers: headers }).then(response => {
                $scope.listDoctorsDB = response.data;
                // console.log($scope.listDoctorsDB)
            });
        }
    }

    $scope.getListDoctorId = function() {
            $http.get(url + '/doctor-id/'+ $scope.doctorId, { headers: headers }).then(response => {
                $scope.doctorModel = response.data;
            });
    }

    $scope.selectDoctor = function(doctorId) {
        $scope.doctorId = angular.copy(doctorId);
        $scope.booleanDoctorChoosen = true;
        // Gọi hàm xóa và tạo lại thẻ calendar-book-appointment
        $scope.resetCalendarElement(doctorId);
        $scope.getListDoctorId();
    };
    
    $scope.resetCalendarElement = function(doctorId) {
        var oldCalendar = document.getElementById('calendar-book-appointment');
        if (oldCalendar) {
            var parent = oldCalendar.parentNode;
            var classes = oldCalendar.className;
            var newCalendar = document.createElement('div');
            newCalendar.id = 'calendar-book-appointment';
            newCalendar.className = classes;

            parent.removeChild(oldCalendar);
            parent.appendChild(newCalendar);
            
            $scope.initializeFullCalendar(doctorId)
        }
    };
    $scope.initializeFullCalendar = (doctorIdPicked) => {
        window.scrollTo(0, 1000);
        $scope.doctorId = doctorIdPicked;
        var events = [];
    
        let calendarEl = document.getElementById('calendar-book-appointment');
        let calendar = new FullCalendar2.Calendar(calendarEl, {
            timeZone: 'Asia/Ho_Chi_Minh',
            themeSystem: 'bootstrap',
            locale: 'vi',
            buttonText: {
                today: 'Hôm nay',
                month: 'Tháng',
                list: 'Lịch sử'
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            navLinks: true,
            selectable: true,
            selectMirror: true,
            select: function (arg) {
                $scope.daySelected = arg.startStr;

                // Lấy ngày hiện tại
                var today = new Date();
                today.setHours(0, 0, 0, 0); // Đặt giờ phút giây milli giây về 0 để chỉ so sánh ngày

                // Lấy ngày được chọn
                var selectedDate = new Date($scope.daySelected);

                // Nếu ngày được chọn là ngày trước ngày hiện tại thì không làm gì cả
                if (selectedDate < today) {
                    return;
                }

                if ($scope.dutyDays.includes($scope.daySelected)) {
                    var modalElement = document.getElementById('modalBookAppointment');
                    var modal = new bootstrap.Modal(modalElement);
                    modal.show();        
                    $scope.formBookingFill($scope.doctorId, $scope.daySelected);
                    
                    $scope.getListDoctorScheduleByDate($scope.daySelected).then(function() {
                        $scope.getListDoctorScheduleByDoctorId = $scope.listDoctorScheduleByDate.filter(function(schedule) {
                            return schedule.doctor.doctorId === $scope.doctorId;
                        });

                        document.querySelectorAll('.invalid-feedback').forEach(function(element) {
                            element.classList.add('ng-hide');
                        });

                        $scope.getListDoctorUnavailabilityByDoctor();
                    });
                }

            },
            eventClick: function (arg) {
                // console.log("Yo what's");
            },
            editable: true,
            dayMaxEvents: true,
            events: events,
            eventDidMount: function (info) {
                // Custom event rendering logic
            },
            datesSet: function() {
                // Sự kiện được kích hoạt mỗi khi lịch được cập nhật
                addButtonEventListeners();
            }
        });
    
        calendar.render();
        $scope.getListShiftOfDoctorOnMonth();
    
        // Hàm để thêm sự kiện lắng nghe click cho các nút
        function addButtonEventListeners() {
            let todayButton = calendarEl.querySelector('.fc-today-button');
            let prevButton = calendarEl.querySelector('.fc-prev-button');
            let nextButton = calendarEl.querySelector('.fc-next-button');
            let monthButton = calendarEl.querySelector('.fc-dayGridMonth-button');
            
            if (todayButton && !todayButton.classList.contains('listener-added')) {
                todayButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                todayButton.classList.add('listener-added');
            }
    
            if (prevButton && !prevButton.classList.contains('listener-added')) {
                prevButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                prevButton.classList.add('listener-added');
            }
    
            if (nextButton && !nextButton.classList.contains('listener-added')) {
                nextButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                nextButton.classList.add('listener-added');
            }

            if (monthButton && !monthButton.classList.contains('listener-added')) {
                monthButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                monthButton.classList.add('listener-added');
            }
    
        }    
        // Gọi hàm để thêm sự kiện lắng nghe click lần đầu tiên
        addButtonEventListeners();
    };

    $scope.checkShifts = (dateValue) => {
        var doctorId = $scope.doctorId;
        Promise.all([
            $scope.getFreeShiftOfDoctor(1, dateValue, doctorId),
            $scope.getFreeShiftOfDoctor(2, dateValue, doctorId),
            $scope.getFreeShiftOfDoctor(3, dateValue, doctorId)
        ]).then(results => {
            var [shift1, shift2, shift3] = results;
            // console.log(results);
            if (shift1.length == 0 || shift2.length == 0 || shift3.length == 0) {
                var dateElement = document.querySelector(`[data-date="${dateValue}"]`);
                if (dateElement) {
                    dateElement.classList.add('fc-unavailable');
                }
            } else {
                // console.log("Có thể đăng ký hôm nay");
            }
        }).catch(error => {
            // console.log("Có lỗi xảy ra khi kiểm tra các shift: ", error);
        });
    }

    // Cập nhật trạng thái của checkbox "Select All"
    $scope.toggleRowCheckbox = function(service) {
        // Đảo ngược trạng thái checkbox của hàng khi nhấp vào hàng
        service.selected = !service.selected;
        // Cập nhật checkbox "Chọn tất cả" nếu cần
        $scope.updateStatistics()
    };
    $scope.updateSelectAll = function() {
        const allSelected = $scope.foundServices.length > 0 && $scope.foundServices.every(function(service) {
            return service.selected;
        });
    
        $scope.selectAll = allSelected;
        $scope.hasSelectedService = $scope.foundServices.some(function(service) {
            return service.selected;
        });
    
        // Cập nhật thống kê
        $scope.updateStatistics();
    };


    $scope.toggleAllCheckboxes = function(selectAll) {
        $scope.foundServices.forEach(service => {
            service.selected = selectAll;
        });
        $scope.updateStatistics();
    };
    
    // Hàm để kiểm tra các checkbox được chọn
    $scope.updateStatistics = function() {
        $scope.totalPrice = $scope.foundServices
            .filter(service => service.selected)
            .reduce((sum, service) => sum + service.service.price, 0);

        $scope.totalTime = $scope.foundServices
            .filter(service => service.selected)
            .reduce((sum, service) => sum + service.service.timeEstimate, 0);
        
        $scope.hasSelectedService = $scope.foundServices.some(function(service) {
            return service.selected;
        });
    };
    
    $scope.getRecommendation = function() {
        // Giả sử đây là logic để tính số khung thời gian khuyến nghị
        // Bạn có thể thay đổi logic này dựa trên yêu cầu của mình
        return Math.ceil($scope.totalTime / 30); // Ví dụ: 1 khung thời gian mỗi giờ
    };
    $scope.loadEnoughHour = function() {
        $scope.hourLenghtSelected = $('#formShiftHour').val().length;
        console.log($scope.hourLenghtSelected)
    };
    $scope.getTimeString = function() {
        if ($scope.hourSelected.length === 0) {
            return '';
        }
    
        // Sắp xếp mảng dựa trên timeOfShiftId
        var sortedShifts = $scope.hourSelected.slice().sort(function(a, b) {
            return a.timeOfShiftId - b.timeOfShiftId;
        });
    
        // Lấy beginTime của đối tượng đầu tiên và endTime của đối tượng cuối cùng
        var beginTime = sortedShifts[0].beginTime;
        var endTime = sortedShifts[sortedShifts.length - 1].endTime;
    
        return beginTime + ' - ' + endTime;
    };
    $scope.resetForm = function() {

        $('#formSymptom').val(null).trigger('change');
        // Đặt mô hình AngularJS về giá trị rỗng
        $scope.selectedIssues = [];
        $scope.hasSelectedService = false;
        $scope.selectedShift = [];
        $('#formShiftHour').val(null).trigger('change');
        $scope.selectedShiftHour = [];
        $scope.totalPrice = 0;
        $scope.totalTime = 0;
        $scope.formAppointmentRequestNote = []
        $scope.loadTreatmeantAndServiceByIssue();
    }
    $scope.selectSpecialty(specialtyId) 
    $scope.getListDoctor()
    $scope.getListSpecialty()
    $scope.init()
    $scope.getListShift()
    $scope.getListDentalIssues()
    $scope.getListTreatment()
    $scope.getListService()
    $scope.getListIssuesTreatmentAutomation()
    $scope.getListServiceTreatmentAutomation()
    //Lấy dữ liệu đặt lịch
    $scope.getListAppointmentType()
    $scope.getListAppointmentStatus()
    $scope.getListAppointmentPatientRecord()
    $scope.getPatientById(1)
    $scope.getListTimeOfShift()
})