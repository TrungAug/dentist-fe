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



})