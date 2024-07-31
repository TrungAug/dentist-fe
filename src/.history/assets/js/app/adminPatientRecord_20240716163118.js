
app.controller('AdminPatientRecord', function ($scope, $http, $rootScope, $location, $timeout, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),

    }
    //code here

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            }
        );

        $('.drgpicker-filter-record').daterangepicker(
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

        $('.drgpicker-filter-record').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = $('#dateFilterPatientRecord').val();
            let paramsFiler = {
                startStr: moment(selectedDate.split(' - ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
                endStr: moment(selectedDate.split(' - ')[1], 'DD/MM/YYYY').format('YYYY-MM-DD')
            }
           // $scope.getDoctorScheduleByTimeRange("", "", paramsFiler)
        });

        $('#filterCustomer').on('change', function () {
            $timeout(function () {
                var selectedVal = $('#filterCustomer').val()
                $scope.formPatientRecord.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
                console.log("selectedValue",selectedVal)
                console.log("$scope.formPatientRecord.patientId",$scope.formPatientRecord.patientId);
            });
        });
    }

    $scope.initData = () => {
        $scope.formPatientRecord={
            patientId:null,
            dateFilter:moment(new Date()).format("DD/MM/YYYY")
        }
    }

    $scope.getListPatient = () => {
        $http.get(url+'/patient').then(response => {
            $scope.listPatientDB = response.data
            $scope.listPatientDB = [{ patientId: null, fullName: 'Tất cả khách hàng'}].concat($scope.listPatientDB);
        })
    }

    $scope.getAllDateOfAppointment=() => {
        $http.get(url+'/date-of-appointment-except-deleted').then(response=>{
            $scope.listAllDateOfAppointmentDB = response.data
        })
    }

    $scope.getAppointmentByDate=(date) => {
        var params={
            date: date
        }
        $http.get(url+'/appointment-by-date',{params:params}).then(response=>{
            $scope.listAppointmentByDateExceptDeleteddDB = response.data
            console.log("$scope.listAppointmentByDateExceptDeleteddDB",$scope.listAppointmentByDateExceptDeleteddDB);
        })
    }

    //$scope.getAppointmentByDateExceptDeleted("2024-07-05")

    $scope.initializeUIComponents()
    $scope.initData()
    $scope.getListPatient()
    $scope.getAllDateOfAppointment()
})

