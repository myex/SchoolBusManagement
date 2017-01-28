/**
 * Created by CSS on 26-12-2016.
 */
(function () {

    angular.module('myApp').controller('parentNotificationController',parentNotificationController);

    parentNotificationController.$inject = [
        '$scope',
        'parentNotificationService'
    ];

    function parentNotificationController($scope,parentNotificationService) {

        $scope.curpage = 1;
        $scope.itemspage = 15;
        $scope.filteredDoc = [];
        $scope.maxSize = 4;
        $scope.totalItems = 0;

        $scope.showSelectable = function (value) {

            if(value == 'parentNotification'){
                return 'selected';
            }

        };

        $scope.showNotificationMenu = function () {

            return true;

        };

        $scope.status = {
            isCustomHeaderOpen: false,
            isFirstOpen: true,
            isFirstDisabled: false
        };

        var getParentNotification = function () {

            parentNotificationService.getParentNotification().then(function (result,err) {
                if(err){
                    alert(err);
                }else {
                    $scope.notificationObject = result.data;

                    $scope.totalItems = $scope.notificationObject.length;
                    $scope.$watch('curpage + itemspage', function() {
                        var begin = (($scope.curpage - 1) * $scope.itemspage),
                            end = begin + $scope.itemspage;
                        $scope.parentNotificationData = $scope.notificationObject.slice(begin, end);
                    });

                }
            });

        };

        getParentNotification();
        
    }

})();