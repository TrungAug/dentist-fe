
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
                $scope.formPatientRecord.filerPatient = $('#filterCustomer').val();
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
            $scope.listPatientDB = [{ patientId: null, fullName: 'Tất cả'}].concat($scope.listPatientDB);
        })
    }

    $scope.initializeUIComponents()
    $scope.getListPatient()
})

