angular.module('mustard', [
    'ngRoute',
    'ngTouch',
    'mustard.cordova',
    'mustard.app.login',
    'mustard.app.registration',
    'mustard.app.main',
    'mustard.app.mission',
    'mustard.app.profile',
    'mustard.app.settings',
    'mustard.game.simulator',
    'leaflet-directive',
    'ui.bootstrap'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/login', {
        controller: 'LoginCtrl',
        templateUrl: 'js/app/controllers/login/login.tpl.html'
    })

    .when('/register', {
        controller: 'RegistrationCtrl',
        templateUrl: 'js/app/controllers/registration/registration.tpl.html'
    })

    .when('/main', {
        controller: 'MainCtrl',
        templateUrl: 'js/app/controllers/main/main.tpl.html'
    })

    .when('/mission/:id', {
        controller: 'MissionCtrl',
        templateUrl: 'js/app/controllers/mission/mission.tpl.html'
    })

    .when('/profile', {
        controller: 'ProfileCtrl',
        templateUrl: 'js/app/controllers/user-profile/profile.tpl.html'
    })

    .when('/settings', {
        controller: 'SettingsCtrl',
        templateUrl: 'js/app/controllers/settings/settings.tpl.html'
    })

    .when('/game/mission/:scenario', {
        controller: 'SimulatorCtrl',
        templateUrl: 'js/game/controllers/simulator/mission.tpl.html',
        resolve: {
            scenario: ['$http', '$q', '$route', function ($http, $q, $route) {
                var deferred = $q.defer();
                var scenario = $route.current.params.scenario + '.json';

                $http({
                    method: "GET",
                    url: 'js/game/scenarios/' + scenario
                }).success(function (response) {
                        deferred.resolve(response);
                    });
                return deferred.promise;
            }]
        }
    })

    .when('/game/training', {
        controller: 'SimulatorCtrl',
        templateUrl: 'js/game/controllers/simulator/training.tpl.html',
        resolve: {
            scenario: ['$http', '$q', function ($http, $q) {
                var deferred = $q.defer();
                $http({
                    method: "GET",
                    url: "js/game/scenarios/PracticeScenario.json"
                }).success(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            }]
        }
    })

    .otherwise({redirectTo: '/main'});

}).run(function ($rootScope, $location, user) {

    $rootScope.$on("$locationChangeStart", function() {
        user.restoreFromLocal(function (isRestored) {
            !isRestored && $location.path('/login');
        });
    });
});
