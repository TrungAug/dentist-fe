
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

        $('#filterCustomer').on('change', function () {
            $timeout(function () {
                var selectedValue = $('#filterCustomer').val()
                $scope.formPatientRecord.filerPatient = selectedValue
                alert("selectedValue",selectedValue)
            });
        });
    }

    $scope.initData = () => {
        $scope.formPatientRecord={
            patientId:null
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

