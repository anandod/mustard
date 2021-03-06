angular.module('subtrack90.app.userProfile', [
    'subtrack90.app.user'
])

/**
 * @module Profile
 * @class ProfileCtrl (controller)
 */
.controller('ProfileCtrl', function ($scope, user) {
    /**
     * User's achievements
     *
     * @type {Array}
     */
    $scope.achievements = user.achievements;


    /**
     * Get the levels with complete missions only
     *
     * @type {Array}
     */
    $scope.levels = [];
    angular.copy(user.levels, $scope.levels);

    $scope.levels = _.filter($scope.levels, function (level) {
        level.missions = _.where(level.missions, { status: 'SUCCESS' });

        return level.missions.length;
    });
});
