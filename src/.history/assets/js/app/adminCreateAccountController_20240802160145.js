app.controller('AdminCreateAccountController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here
    $scope.dataObject = []
    $scope.selectedOption = ''
    $scope.isInvalidInput = false;
    $scope.isValidInput = false;
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
    $scope.accForm = {
        email: '',
        password: '',
        role: '',
        dentalStaffId: '',
        patientId: '',
        doctorId: ''
    }

    $scope.getRoleOption = async (option) => {
        $scope.accForm.role = option.roleId
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
            case 'ADMIN':
            case 'LE_TAN':
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
        if (op === 'ADMIN' || op === 'LE_TAN') {
            op = 'NHAN_VIEN'
        }

        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            });

        $('#selectedOption' + op).on('change', function () {
            $timeout(function () {
                let selectedVal = $('#selectedOption' + op).val()
                if (op === 'BENH_NHAN') {
                    $scope.accForm.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
                } else if (op === 'BAC_SI') {
                    $scope.accForm.doctorId = processSelect2Service.processSelect2Data(selectedVal)[0]
                } else {
                    $scope.accForm.dentalStaffId = processSelect2Service.processSelect2Data(selectedVal)[0]
                }
            });
        });
    }

    $scope.getRole = () => {
        $http.get(url + '/role-except-deleted').then(response => {
            $scope.listRoleDB = response.data
        })
    }

    $scope.generatePassword = ($event) => {
        $event.preventDefault();   
        $scope.accForm.password = "";

        var upperChars = ["A","B","C","D","E","F","G","H","J","K","M","N","P","Q","R","S","T","U","V","W","X","Y","Z"];
        var lowerChars = ["a","b","c","d","e","f","g","h","j","k","m","n","p","q","r","s","t","u","v","w","x","y","z"];
        var numbers = ["2","3","4","5","6","7","8","9"];
        var symbols = ["!","#","$","%","&","*","+","-","?","@"];
        var similars_lower = ["i","l","o"];
        var similars_upper = ["I","L","O"];
        var similars_numbers = ["1","0"];
        var similars_symbols = ["|"];
        var ambiguous = ["\"","'","(",")",",",".","/",":",";","<","=",">","[","\\","]","^","_","`","{","}","~"];
        var passwordLength = 8

        var combinedArray = upperChars.concat(
            lowerChars,
            numbers,
            symbols,
            similars_lower,
            similars_upper,
            similars_numbers,
            similars_symbols,
            ambiguous
        );
           
        var randomIndex;
        if (combinedArray.length > 1) {
            for (var i = 0; i < passwordLength; i++) {
                randomIndex = Math.floor(Math.random() * combinedArray.length);
                $scope.accForm.password = $scope.accForm.password + combinedArray[randomIndex];
            }
        }
    }


    $scope.validEmail = function() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = $scope.accForm.email;
        let checkEmail=emailPattern.test(email)
        if (checkEmail) {
            $scope.isValidInput = true;
            $scope.isInvalidInput = false;
        } else {
            $scope.isValidInput = false;
            $scope.isInvalidInput = true;
        }
        return checkEmail
    };

    $scope.validateOnFocus = function() {
        $scope.isInvalid = false;
        $scope.isValid = false;
    };

    $scope.validateOnBlur = function() {
        $scope.validEmail();
    };

    $scope.getRole()

})