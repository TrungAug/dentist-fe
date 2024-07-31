
app.controller('AdminPatientRecord', function ($scope, $http, $rootScope, $location, $timeout, processSelect2Service, TimezoneService, $route) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),

    }

    $scope.appointments = []

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            }
        );

        $('.select2-multi').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });

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
            // let paramsFiler = {
            //     startStr: moment(selectedDate.split(' - ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
            //     endStr: moment(selectedDate.split(' - ')[1], 'DD/MM/YYYY').format('YYYY-MM-DD')
            // }

        });

        $('#filterCustomer').on('change', function () {
            $timeout(function () {
                var selectedVals = $('#filterCustomer').val()

                let selectPatientIds = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getAllAppGroupByDate("", selectPatientIds, [])
                // $scope.formPatientRecord.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
                // console.log("selectedValue", selectedVal)
                // console.log("$scope.formPatientRecord.patientId", $scope.formPatientRecord.patientId);
            });
        });
    }

    $scope.initData = () => {
        $scope.formPatientRecord = {
            patientId: null,
            dateFilter: moment(new Date()).format("DD/MM/YYYY")
        }
    }

    $scope.getListPatient = () => {
        $http.get(url + '/patient').then(response => {
            $scope.listPatientDB = response.data
            // $scope.listPatientDB = [{ patientId: null, fullName: 'Tất cả khách hàng' }].concat($scope.listPatientDB);
        })
    }

    $scope.getAllAppGroupByDate = (selectedDate, selectPatientIds, selectDoctorIds) => {
        let pIds = ""
        let dIds = ""
        if (selectPatientIds.length > 0) {
            pIds = selectPatientIds.join(',')
        }
        if (selectDoctorIds.length > 0) {
            dIds=selectDoctorIds.join(',')
        }
        let params = {
            startDate: selectedDate == "" ? "" : moment(selectedDate.split(' - ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
            endDate: selectedDate == "" ? "" : moment(selectedDate.split(' - ')[1], 'DD/MM/YYYY').format('YYYY-MM-DD'),
            patientIds: pIds,
            doctorIds: dIds
        }
        $http.get(url+'/appointment-group-by-date',{params:params}).then(response =>{
            $scope.listAppGroupByDateDB=[]
            for(let key in response.data){
                if (response.data.hasOwnProperty(key)) {
                    if(response.data[key].length > 0){
                        $scope.listAppGroupByDateDB.push([key, response.data[key]])
                    }            
                }
            }
            // $scope.listAppGroupByDateDB=response.data
            console.log("$scope.listAppGroupByDateDB",$scope.listAppGroupByDateDB);
        })
    }





    $scope.initializeUIComponents()
    $scope.initData()
    $scope.getListPatient()


})

