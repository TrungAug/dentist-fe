
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

        $('.drgpickerSingle').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                }
            }
        );

        $('.drgpickerSingle').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = picker.startDate.format('DD/MM/YYYY')
            $scope.formPatientRecord.dateFilter=selectedDate
            console.log("selectedDate",selectedDate)
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

    $scope.initializeUIComponents()
    $scope.initData()
    $scope.getListPatient()
})

