angular.module('subtrack90.app.debug', [
    'subtrack90.app.user',
    'subtrack90.app.splashScreen',
    'subtrack90.game.message',
    'LocalStorageModule'
])

/**
 * @module Debug
 * @class DebugCtrl (controller)
 */
.controller('DebugCtrl', function ($scope, $timeout, user, localStorageService, $location, message, splashScreen) {

    /**
     * DEBUG CONSOLE METHODS
     */

    var localTime = new Date().toLocaleTimeString();

    // Mock messages
    $scope.messages = [
        {title: 'You achieve something', type: 'info', text: 'Message #1', time: localTime},
        {title: 'Something happened', type: 'danger', text: 'Message #2', time: localTime},
        {title: 'Warning message', type: 'warning', text: 'Message #3', time: localTime},
        {title: 'Your ship is upgraded', type: 'info', text: 'Message #4', time: localTime},
        {title: 'Missile launched', type: 'danger', text: 'Message #5', time: localTime},
        {title: 'You have something weird on your ship', type: 'warning', text: 'Message #6', time: localTime},
        {title: 'Another achievement ', type: 'info', text: 'Message #7', time: localTime},
        {title: 'You are drowning', type: 'danger', text: 'Message #8', time: localTime},
        {title: 'Gud Luck!', type: 'info', text: 'Message #9', time: localTime},
        {title: 'Hey it is another warning message', type: 'warning', text: 'Message #10', time: localTime},
        {title: 'Missile launched but it missed', type: 'danger', text: 'Message #11', time: localTime},
        {title: 'Buy something in our shop', type: 'info', text: 'Message #12', time: localTime},
        {title: 'You have bought easter skinn for your ship', type: 'info', text: 'Message #13', time: localTime},
        {title: 'Watch out!', type: 'warning', text: 'Message #14', time: localTime},
        {title: 'Happy Easter!', type: 'info', text: 'Message #15', time: localTime},
        {title: 'Something is coming from sky ... UFO', type: 'danger', text: 'Message #16', time: localTime},
        {title: 'You have just bitten the record', type: 'info', text: 'Message #17', time: localTime},
        {title: 'Game tricks wanna read?', type: 'info', text: 'Message #18', time: localTime},
        {title: 'Your ship is out of course!', type: 'danger', text: 'Message #19', time: localTime},
        {title: 'Ship is ready to go', type: 'info', text: 'Message #20', time: localTime},
        {title: 'Hey something is happening', type: 'warning', text: 'Message #21', time: localTime},
        {title: 'Another info message', type: 'info', text: 'Message #22', time: localTime},
        {title: 'You are going to loose?', type: 'warning', text: 'Message #23', time: localTime},
        {title: 'Current objective is done', type: 'info', text: 'Message #24', time: localTime},
        {title: 'What is the objective?', type: 'info', text: 'Message #25', time: localTime},
        {title: 'We detect a submarine?', type: 'danger', text: 'Message #26', time: localTime}
    ];

    $scope.achievements = [
        {name: 'Speed Demon'},
        {name: 'Spitfire'}
    ];

    $scope.user = user;
    $scope.userInStorage = localStorageService.get('user');

    $scope.$watch('user', function () {
        $scope.userInStorage = localStorageService.get('user');
    }, true);

    $scope.addMockAchievement = function (achievementName) {
        user.addAchievement(achievementName);
    };

    $scope.addMockOption = function (options) {
        user.setOptions(options);
    };

    $scope.missionMockCompleted = function (missionId) {
        user.missionCompleted(missionId);
    };

    $scope.missionMockFailed = function (missionId) {
        user.missionFailed(missionId);
    };

    $scope.endGame = function () {
        _.each(user.getMissions(), function (mission) {
            user.missionCompleted(mission.id);
        });
    };

    $scope.logout = function () {
        user.deauthorizeUser();
        $location.path('/login');
    };

    $scope.saveUser = function () {
        user.syncWithWeb().then(function (isSaved) {
            message.show('info', 'Notification', ('User is ' + (isSaved ? 'SAVED' : 'NOT SAVED')));
        });
    };

    $scope.showModalMessage = function () {
        message.show('success', 'Test message', 'Text Message');
    };

    $scope.showModalMessageList = function () {
        message.showList($scope.messages);
    };

    $scope.showModalConfirm = function () {
        message.show('info', 'Test message', 'Text Message', true).result.then(
            function () {
                message.show('success', 'Yes!', 'You pushed yes button');
            },

            function () {
                message.show('danger', 'No!', 'You pushed no button');
            }
        );
    };

    $scope.showCompleteMission = function () {
        message.finishMission({
            title: 'Mission Accomplished',
            icon: 'glyphicon-ok',
            achievements: $scope.achievements,
            buttons: [
                {
                    text: 'Main Menu',
                    type: 'default',
                    handler: function () {
                        $location.path('/main');
                    }
                },
                {
                    text: 'Review',
                    type: 'warning',
                    handler: function () {
                        console.log('Review call');
                    }
                },
                {
                    text: 'Next Mission',
                    type: 'success',
                    handler: function () {
                        console.log('Next Mission call');
                    }
                }
            ]
        }).result.then(function () {
            console.log('popup was closed');
        });
    };

    $scope.showFailedMission = function () {
        message.finishMission({
            title: 'Mission Failed',
            icon: 'glyphicon-remove',
            achievements: [],
            buttons: [
                {
                    text: 'Main Menu',
                    type: 'default',
                    handler: function () {
                        $location.path('/main');
                    }
                },
                {
                    text: 'Mission Brief',
                    type: 'warning',
                    handler: function () {
                        console.log('Brief call');
                    }
                },
                {
                    text: 'Replay',
                    type: 'success',
                    handler: function () {
                        console.log('Replay call');
                    }
                }
            ]
        }).result.then(function () {
            console.log('popup was closed');
        });
    };

    $scope.showSplash = function () {
        splashScreen.unblock();
        splashScreen.show();

        $timeout(function () {
            splashScreen.hide();
        }, 3000);
    }
});
