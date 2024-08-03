app.controller('AdminCreateAccountController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService,processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here
    $scope.dataObject = []
    $scope.selectedOption = ''
    // $scope.dataOptions = [
    //     {
    //         id: 1,
    //         name: 'Bệnh nhân'
    //     },
    //     {
    //         id: 2,
    //         name: 'Bác sĩ'
    //     },
    //     {
    //         id: 3,
    //         name: 'Nhân viên'
    //     },
    // ]
    $scope.accForm={
        email:'',
        password:'',
        role:'',
        dentalStaffId:'',
        patientId:'',
        doctorId:''
    }

    $scope.getRoleOption = async (option) => {
        $scope.accForm.role=option.roleId
        let op = option.roleName
        switch (op) {
            case 'BENH_NHAN':
                await $http.get(url + '/patient-except-deleted').then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 'BENH_NHAN'
                })

                break
            case 'BAC_SI':
                await $http.get(url + '/doctor-except-deleted').then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 'BAC_SI'
                })

                break
            case 'NHAN_VIEN':
            // case 'ADMIN':
            // case 'LE_TAN':
                await $http.get(url + '/dental-staff-except-deleted').then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 'NHAN_VIEN'
                })
                break
            default:
                $scope.selectedOption = ''
                console.log("ID tùy chọn không hợp lệ:", op);
                break
        }
         $scope.initializeUIComponents(option)
    }

    $scope.initializeUIComponents = (option) => {
        let op = option.roleName

        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            });

        $('#selectedOption'+op).on('change', function () {
            $timeout(function () {
                let selectedVal = $('#selectedOption'+op).val()
                if(op==='BENH_NHAN'){
                    $scope.accForm.patientId=processSelect2Service.processSelect2Data(selectedVal)[0]
                }else if(op==='BAC_SI'){
                    $scope.accForm.doctorId=processSelect2Service.processSelect2Data(selectedVal)[0]
                }else{
                    $scope.accForm.dentalStaffId=processSelect2Service.processSelect2Data(selectedVal)[0]
                }
            });
            console.log("$scope.accForm",$scope.accForm);
        });
    }

    $scope.getRole=()=>{
        $http.get(url+'/role-except-deleted').then(response => {
            $scope.listRoleDB=response.data
        })
    }

    $scope.getRole()

})