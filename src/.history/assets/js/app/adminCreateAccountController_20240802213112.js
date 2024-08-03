app.controller('AdminCreateAccountController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here
    $scope.dataObject = []
    $scope.selectedOption = ''
    $scope.isInvalidInput = false;
    $scope.isValidInput = false;

    $scope.initAccountForm = () => {
        $scope.accForm = {
            email: '',
            password: '',
            roleId: '',
            dentalStaffId: '',
            patientId: '',
            doctorId: '',
            firstname: 'Tài khoản tạo từ admin',
            lastname: 'Tài khoản tạo từ admin'
        }

        $scope.mailInfo = {
            from: '',
            to: '',
            subject: '',
            body: ''
        }

        $scope.validParam = {
            doctorId: null,
            patientId: null,
            doctorId: null,
        }
    }

    $scope.getRoleOption = async (option) => {
        $scope.accForm.roleId = option.roleId
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
                let processedValue = processSelect2Service.processSelect2Data(selectedVal)[0];
                $scope.validParam = {
                    doctorId: null,
                    patientId: null,
                    doctorId: null,
                }
                function updateAndCheckUser(paramName, value) {
                    $scope.accForm[paramName] = value;
                    $scope.validParam[paramName] = value;
                    $scope.checkUserByAnObject($scope.validParam);
                }
                switch (op) {
                    case 'BENH_NHAN':
                        updateAndCheckUser('patientId', processedValue);
                        break;
                    case 'BAC_SI':
                        updateAndCheckUser('doctorId', processedValue);
                        break;
                    default:
                        updateAndCheckUser('dentalStaffId', processedValue);
                        break;
                }
               
            });
        });
    }

    $scope.getRole = () => {
        $http.get(url + '/role-except-deleted').then(response => {
            $scope.listRoleDB = response.data
        })
    }

    $scope.checkUserByAnObject = (param) => {    
        $http.get(url + '/check-exist-user-by-object',{params:param}).then(response => {
            $scope.isExistUser = response.data.message
        })
    }

    $scope.checkExistEmail= (email) => {
        let p={
            email: email
        }
        $http.get(url + '/check-exist-email',{params:p}).then(response => {
            $scope.isExistEmail = response.data.message
            console.log("$scope.isExistEmail",$scope.isExistEmail);      
        })
    }

    $scope.generatePassword = ($event) => {
        $event.preventDefault();
        $scope.accForm.password = "";

        var upperChars = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        var lowerChars = ["a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var numbers = ["2", "3", "4", "5", "6", "7", "8", "9"];
        var symbols = ["!", "#", "$", "%", "&", "*", "+", "-", "?", "@"];
        var similars_lower = ["i", "l", "o"];
        var similars_upper = ["I", "L", "O"];
        var similars_numbers = ["1", "0"];
        var similars_symbols = ["|"];
        var ambiguous = ["\"", "'", "(", ")", ",", ".", "/", ":", ";", "<", "=", ">", "[", "\\", "]", "^", "_", "`", "{", "}", "~"];
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
        const passwordEl = document.getElementById('user-password')
        passwordEl.classList.add('input-success');
    }


    $scope.validateEmail = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = $scope.accForm.email;
        let checkEmail = emailPattern.test(email)
        if (checkEmail) {
            $scope.isValidInput = true;
            $scope.isInvalidInput = false;
        } else {
            $scope.isValidInput = false;
            $scope.isInvalidInput = true;
        }
        return checkEmail
    }

    $scope.validateOnFocus = () => {
        $scope.isInvalid = false;
        $scope.isValid = false;
    }

    $scope.validateOnBlur = () => {
        $scope.validateEmail();
        $scope.checkExistEmail($scope.accForm.email)
    }

    $scope.validateForm = () => {
        let acc = $scope.accForm
        let valid = false
        let validateEmail = $scope.validateEmail()
        if (acc.dentalStaffId == '' && acc.doctorId == '' && acc.patientId == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn thông tin người dùng!",
                icon: "error"
            })
        } else if (acc.email == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập email!",
                icon: "error"
            })
        } else if (!validateEmail) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Email nhập không đúng định dạng!",
                icon: "error"
            })
        } else if (acc.password == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng tạo mật khẩu!",
                icon: "error"
            })
        } else {
            valid = true
        }
        return valid
    }

    $scope.createAccount = () => {
        let checkForm = $scope.validateForm()

        const passwordEl = document.getElementById('user-password')
        passwordEl.classList.add('input-error');

        if (checkForm) {
            console.log("$scope.accForm", $scope.accForm);
            $scope.mailInfo = {
                from: 'trung2894@gmail.com',
                to: $scope.accForm.email,
                subject: 'Thống báo tạo tài khoản',
                body: '<p>Chúc mừng bạn đã tạo tại khoản thành công tại nha khoa Tooth Teeth.</p> <p>Mật khẩu của bạn là: ' + '<bold>' + $scope.accForm.password + '</bold>' + '</p>'
            }

            Swal.fire({
                title: 'Đang thao tác. </br> Vui lòng chờ trong giây lát !',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timerProgressBar: true,
                timer: 0,
                html: `<div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                        </div>`,
            });

            let accRequest = $http.post(url + '/register', $scope.accForm)
            let emailRequest = $http.post(url + '/send-account-info', $scope.mailInfo)
            Promise.all([accRequest, emailRequest]).then(() => {
                Swal.close()
            }).finally(() => {
                Swal.fire({
                    title: "Thành công!",
                    html: "Tạo tài khoản thành công!",
                    icon: "success"
                }).then(() => {
                    $scope.initAccountForm()
                    const passwordEl = document.getElementById('user-password')
                    passwordEl.classList.remove('input-success');
                    passwordEl.classList.remove('input-error');
                    const emaildEl = document.getElementById('user-email')
                    emaildEl.classList.remove('input-success');
                    $scope.$apply()
                })
            })


        }
    }

    $scope.getRole()
    $scope.initAccountForm()
})