app.controller('AdminListInvoice', function ($scope, $http, $rootScope, $location, $timeout, TimezoneService, $route,API,adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    //code here

    var defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.listAppointmentServiceDB = []
    $scope.selectedDates = []

    $scope.editInvoiceForm = []

    $scope.setupTab = () => {
        $scope.currentTab = -1;
        $scope.selectTab = (tab, $event) => {
            $event.preventDefault()
            $scope.currentTab = tab;
        }
        $scope.isSelected = (tab) => {
            return $scope.currentTab === tab;
        }
    }

    $scope.initializeFullCalendar = () => {
        $scope.extractTimeFromISOString = (isoString) => {
            var timePart = isoString.split('T')[1];
            return timePart.slice(0, 5);
        }


    }
    $scope.getStatusColor = function (status) {
        if (status) { // assuming true for paid
            return 'green';
        } else {
            return 'red';
        }
    };

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
            });
        $('.select2-multi').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });
        $('.drgpicker').daterangepicker(
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
                // isInvalidDate: function (date) {
                //     return registeredDates.includes(date.format('YYYY-MM-DD'));
                // }
            }
        );
        $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = $('#formAppoinmentSearchDate').val();
            $scope.getDateFilter(selectedDate)
        });
        $('.time-input').timepicker(
            {
                'scrollDefault': 'now',
                'zindex': '9999' /* fix modal open */
            });
        /** date range picker */
        if ($('.datetimes').length) {
            $('.datetimes').daterangepicker(
                {
                    timePicker: true,
                    startDate: moment().startOf('hour'),
                    endDate: moment().startOf('hour').add(32, 'hour'),
                    locale:
                    {
                        format: 'M/DD hh:mm A'
                    }
                });
        }
        var start = moment().subtract(29, 'days');
        var end = moment();

        function cb(start, end) {
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        $('#reportrange').daterangepicker(
            {
                startDate: start,
                endDate: end,
                ranges:
                {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);
        cb(start, end);
        $('.input-placeholder').mask("00/00/0000",
            {
                placeholder: "__/__/____"
            });
        $('.input-zip').mask('00000-000',
            {
                placeholder: "____-___"
            });
        $('.input-money').mask("#.##0,00",
            {
                reverse: true
            });
        $('.input-phoneus').mask('(000) 000-0000');
        $('.input-mixed').mask('AAA 000-S0S');
        $('.input-ip').mask('0ZZ.0ZZ.0ZZ.0ZZ',
            {
                translation:
                {
                    'Z':
                    {
                        pattern: /[0-9]/,
                        optional: true
                    }
                },
                placeholder: "___.___.___.___"
            });
        // editor
        var editor = document.getElementById('editor');
        if (editor) {
            var toolbarOptions = [
                [
                    {
                        'font': []
                    }],
                [
                    {
                        'header': [1, 2, 3, 4, 5, 6, false]
                    }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [
                    {
                        'header': 1
                    },
                    {
                        'header': 2
                    }],
                [
                    {
                        'list': 'ordered'
                    },
                    {
                        'list': 'bullet'
                    }],
                [
                    {
                        'script': 'sub'
                    },
                    {
                        'script': 'super'
                    }],
                [
                    {
                        'indent': '-1'
                    },
                    {
                        'indent': '+1'
                    }], // outdent/indent
                [
                    {
                        'direction': 'rtl'
                    }], // text direction
                [
                    {
                        'color': []
                    },
                    {
                        'background': []
                    }], // dropdown with defaults from theme
                [
                    {
                        'align': []
                    }],
                ['clean'] // remove formatting button
            ];
            var quill = new Quill(editor,
                {
                    modules:
                    {
                        toolbar: toolbarOptions
                    },
                    theme: 'snow'
                });
        }
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (function () {
            'use strict';
            window.addEventListener('load', function () {
                // Fetch all the forms we want to apply custom Bootstrap validation styles to
                var forms = document.getElementsByClassName('needs-validation');
                // Loop over them and prevent submission
                var validation = Array.prototype.filter.call(forms, function (form) {
                    form.addEventListener('submit', function (event) {
                        if (form.checkValidity() === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            }, false);
        })();

    }
    $scope.calculateTotalPrice = function (services) {
        return services.reduce((total, service) => total + (service.price * (service.quantity || 1)), 0);
    };


    $scope.convert_text = function (totalAmount) {
        return to_vietnamese(totalAmount);
    };
    $scope.calculateAge = function (birthdate) {
        if (!birthdate) return null;

        var today = new Date();
        var birthDate = new Date(birthdate);

        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    $scope.editInvoice = function (invoice) {
        $scope.editInvoiceForm = angular.copy(invoice);
        $scope.editInvoiceForm.totalAmount = $scope.calculateTotalPrice(invoice.services);
        $scope.editInvoiceForm.text = $scope.convert_text($scope.editInvoiceForm.totalAmount);
        $scope.editInvoiceForm.patientAge = $scope.calculateAge($scope.editInvoiceForm.appointment.patient.birthday);
    };
    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status').then(resp => {
            $scope.listAppointmentStatusBD = resp.data
        })
    }
    $scope.getListAppointmentService = () => {
        $scope.clearDateFilter();
        $http.get(url + '/appointment-invoice').then(respone => {
            $scope.appointments = respone.data
            console.log("$scope.appointmentservice", $scope.appointments);
            $(document).ready(function () {
                $('#dataTable-list-invoice').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "All"]
                    ],
                    language: {
                        sProcessing: "Đang xử lý...",
                        sLengthMenu: "Hiển thị _MENU_ mục",
                        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
                        sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                        sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                        sInfoFiltered: "(được lọc từ _MAX_ mục)",
                        sInfoPostFix: "",
                        sSearch: "Tìm kiếm:",
                        sUrl: "",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }
    $scope.getListAppointmentServiceClear = () => {
        $scope.clearDateFilter();
        $http.get(url + '/appointment-invoice').then(respone => {
            $scope.appointments = respone.data
            console.log("$scope.appointmentservice", $scope.appointments);
        }).catch(err => {
            console.log("Error", err);
        })
    }
    $scope.formAppoinmentFilter = {
        filterDate: ''
    };
    $scope.getDateFilter = function (dateRange) {

        console.log('Filtering by date range:', dateRange);
        let dates = dateRange.split(' - ');
        let startDate = dates[0];
        let endDate = dates[1];
        console.log('Start date:', startDate, endDate);

        $http.post(url + '/appointment-filter', {
            startDate: startDate,
            endDate: endDate
        }).then(function (response) {
            $scope.appointments = response.data;
            table.clear().rows.add($scope.appointments).draw();
        }, function (error) {
            console.error('Error fetching data:', error);
        });
    };
    $scope.clearDateFilter = function () {
        $scope.formAppoinmentFilter.filterDate = '';
        var dateRangePicker = $('#formAppoinmentSearchDate').data('daterangepicker');
        if (dateRangePicker) {
            dateRangePicker.setStartDate(moment().startOf('day'));
            dateRangePicker.setEndDate(moment().startOf('day'));
            $('#formAppoinmentSearchDate').val('');
        }
    };
    $scope.getListAppointmentServiceCancel = () => {
        $http.get(url + '/appointment-invoice').then(respone => {
            $scope.appointments = respone.data
            $scope.filteredAppointments = $scope.appointments.filter(function (appointment) {
                return appointment.status == true;
            });
            console.log("$scope.appointmentservice cancel", $scope.filteredAppointments);
            $(document).ready(function () {
                $('#dataTable-list-invoice-cancel').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "All"]
                    ],
                    language: {
                        sProcessing: "Đang xử lý...",
                        sLengthMenu: "Hiển thị _MENU_ mục",
                        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
                        sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                        sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                        sInfoFiltered: "(được lọc từ _MAX_ mục)",
                        sInfoPostFix: "",
                        sSearch: "Tìm kiếm:",
                        sUrl: "",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.payments = [];
    $scope.payments = async function () {

        const result = await Swal.fire({
            title: "Thanh toán hóa đơn",
            text: "Bạn có chắc thanh toán hóa đơn này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Chấp nhận"
        });

        if (result.isConfirmed) {
            $scope.payments = $scope.editInvoiceForm;
            var PaymentRequest = {
                appointmentId: $scope.payments.appointment.appointmentId,
                text: $scope.payments.text,
            };
            Swal.fire({
                title: 'Đang thao tác. </br> Vui lòng chờ trong giây lát !',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timerProgressBar: true,
                timer: 0,
                html: `<div class="loadingspinner">
                    <div id="square1"></div>
                    <div id="square2"></div>
                    <div id="square3"></div>
                    <div id="square4"></div>
                    <div id="square5"></div>
                </div>`,
                onBeforeOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                const response = await $http.post(url + '/sendMail', PaymentRequest, { headers: headers });

            } catch (err) {
                console.error(err);
                // Xử lý lỗi nếu cần
            } finally {

                Swal.close();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Thanh toán thành công",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    $('#myModal').modal('hide');
                    window.location.href = "#!admin/list-invoice";
                });
            }
        }
    };

    $scope.editAppoinment = (appointment, $event) => {
        $event.preventDefault()
        if (appointment != null) {
            console.log("appointment", appointment);
        }
        const formTab = document.getElementById('form-tab-appoinment');
        formTab.click();
    }

    $scope.refresh = () => {
        $route.reload()
        $timeout(function () {
            const tabLink = document.querySelector('.nav-link[ng-click*="selectTab(-2"]')
            tabLink.click();
        }, 1000)
    }

    $scope.isDisabled = function (status) {
        return ['Hoàn Thành', 'Đã Hủy', 'Không Đến', 'Hoãn'].includes(status);
    };

    $scope.updateStatus = (appoinment) => {
        console.log("appoinment update", appoinment);
    }


    $scope.setupTab()
    $scope.getListAppointmentService();

    $scope.getListAppointmentStatus()
    $scope.initializeFullCalendar()
    $scope.initializeUIComponents()
    $scope.getListAppointmentServiceCancel();
    $scope.initializeCalendars = () => {
        $timeout(() => {
            angular.forEach($scope.listDoctorDB, (doctor) => {
                var calendarId = 'calendar-doctor-' + doctor.doctorId;
                $scope.initializeFullCalendar(calendarId, doctor.doctorId);
            }
            )
        })
    }
    function convert_text(e) {
        var result = document.getElementById('result');
        if (e.validity.valid) {
            result.innerHTML = to_vietnamese(e)
        }
    }
    (function () {
        var default_numbers = ' hai ba bốn năm sáu bảy tám chín';
        var dict = {
            units: ('? một' + default_numbers).split(' '),
            tens: ('lẻ mười' + default_numbers).split(' '),
            hundreds: ('không một' + default_numbers).split(' '),
        }
        const tram = 'trăm';
        var digits = 'x nghìn triệu tỉ nghìn'.split(' ');

        /**
         * additional words
         * @param  {string} block_of_2 [description]
         * @return {string}   [description]
         */
        function tenth(block_of_2) {
            var sl1 = dict.units[block_of_2[1]];
            var result = [dict.tens[block_of_2[0]]]
            if (block_of_2[0] > 0 && block_of_2[1] == 5)
                sl1 = 'lăm';
            if (block_of_2[0] > 1) {
                result.push('mươi');
                if (block_of_2[1] == 1)
                    sl1 = 'mốt';
            }
            if (sl1 != '?') result.push(sl1);
            return result.join(' ');
        }

        /**
         * convert number in blocks of 3
         * @param  {string} block "block of 3 mumbers"
         * @return {string}   [description]
         */
        function block_of_three(block) {

            switch (block.length) {
                case 1:
                    return dict.units[block];

                case 2:
                    return tenth(block);

                case 3:
                    var result = [dict.hundreds[block[0]], tram];
                    if (block.slice(1, 3) != '00') {
                        var sl12 = tenth(block.slice(1, 3));
                        result.push(sl12);
                    }
                    return result.join(' ');
            }
            return '';
        }
        /**
         * Get number from unit, to string
         * @param  {mixed} nStr input money
         * @return {String}  money string, removed digits
         */
        function formatnumber(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        };

        function digit_counting(i, digit_counter) {
            var result = digits[i]

            return result
        }
        function to_vietnamese(input, currency) {
            var str = parseInt(input) + '';
            var index = str.length;
            if (index == 0 || str == 'NaN')
                return '';
            var i = 0;
            var arr = [];
            var result = []

            //explode number string into blocks of 3numbers and push to queue
            while (index >= 0) {
                arr.push(str.substring(index, Math.max(index - 3, 0)));
                index -= 3;
            }
            //loop though queue and convert each block
            var digit_counter = 0;
            var digit;
            var adding;
            for (i = arr.length - 1; i >= 0; i--) {
                if (arr[i] == '000') {
                    digit_counter += 1;
                    if (i == 2 && digit_counter == 2) {
                        result.push(digit_counting(i + 1, digit_counter));
                    }
                }
                else if (arr[i] != '') {
                    digit_counter = 0
                    result.push(block_of_three(arr[i]))
                    digit = digit_counting(i, digit_counter);
                    if (digit && digit != 'x') result.push(digit);
                }
            }
            if (currency)
                result.push(currency);
            //remove unwanted white space
            return result.join(' ')
        }

        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            module.exports = to_vietnamese;
        }
        else if (typeof window !== undefined) {
            window.to_vietnamese = to_vietnamese;
        }
        return to_vietnamese
    })();
})
