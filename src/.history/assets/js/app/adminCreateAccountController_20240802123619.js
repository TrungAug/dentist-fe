app.controller('AdminCreateAccountController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here
    $scope.dataObject = []
    $scope.selectedOption = 0
    $scope.dataOptions = [
        {
            id: 1,
            name: 'Bệnh nhân'
        },
        {
            id: 2,
            name: 'Bác sĩ'
        },
        {
            id: 3,
            name: 'Nhân viên'
        },
    ]
    $scope.accForm={
        firstname:'',
        lastname:'',
        email:'',
        password:'',
        gender:'',
        birthDay:'',
        role:'',
        dentalStaffId:'',
        patientId:'',
        doctorId:''
    }

    $scope.getOption = async (option) => {
        let op = option.id
        switch (op) {
            case 1:
                await $http.get(url + '/patient-except-deleted').then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 1
                })

                break
            case 2:
                await $http.get(url + '/doctor-except-deleted').then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 2
                })

                break
            case 3:
                await $http.get(url + '/dental-staff-except-deleted').then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 3
                })

                break
            default:
                $scope.selectedOption = 0
                console.log("ID tùy chọn không hợp lệ:", op);
                break
        }

        console.log("$scope.selectedOption", $scope.selectedOption == 1);
        $scope.initializeUIComponents(option)
    }

    $scope.initializeUIComponents = (option) => {
        let op = option.id
        console.log("op kaka", op);

        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            });

        $('#selectedOption'+op).on('change', function () {
            $timeout(function () {
                let selectedVal = $('#selectedOption'+op).val()
                console.log("selectedVal",selectedVal);
               //$scope.formUpApp.appointmentTypeId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
    }

})