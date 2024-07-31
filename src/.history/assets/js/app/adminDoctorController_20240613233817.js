app.controller('AdminDoctorController', function ($scope, $http, $rootScope, $location,$timeout) {
    let url = "http://localhost:8080/api/v1"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.listDegreesTypeDB = [
        { degreesId: 1, degreesName: 'Răng hàm mặt' },
        { degreesId: 2, degreesName: 'Nhổ răng' },
        { degreesId: 3, degreesName: 'Trồng răng' },
        { degreesId: 4, degreesName: 'Chỉnh nha' },
        { degreesId: 5, degreesName: 'Nha sĩ tổng quát' },
        { degreesId: 6, degreesName: 'Nha sĩ trẻ em' },
        // Các chuyên khoa khác trong nha khoa
    ];

    $timeout(function() {
        $('#dataTable-list-doctor').DataTable({
            autoWidth: true,
            "lengthMenu": [
                [16, 32, 64, -1],
                [16, 32, 64, "All"]
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
    }, 0);
})