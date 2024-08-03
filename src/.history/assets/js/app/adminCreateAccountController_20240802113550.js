app.controller('AdminCreateAccountController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here

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

    $scope.getOption = (option) => {
        console.log("option", option);
        let op = option.id
        switch (op) {
            case 1:
                break
            case 2:
                break
            case 3:
                break
            default:
                break
        }
    }


})