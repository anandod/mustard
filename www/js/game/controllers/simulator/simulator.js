angular.module('mustard.game.simulator', [
    'mustard.game.movementSimulation',
    'mustard.game.spatialViewDirective',
    'mustard.game.timeDisplayDirective',
    'mustard.game.shipControlsDirective',
    'mustard.game.timeBearingDisplayDirective',
    'mustard.game.decision',
    'mustard.game.detection',
    'mustard.game.geoMath',
    'mustard.game.movement',
    'mustard.game.objectives'
])

/**
 * @module Game
 * @class GameCtrl (controller)
 */
.controller('SimulatorCtrl', ['$scope', 'scenario', 'movement', function ($scope, scenario, movement) {

    _.mixin({
        targetShips: function(vessels) {
            return _.omit(vessels, 'ownShip');
        }
    });

    /**
     * Target vessels state.
     * @type {Array}
     */
    $scope.vesselsState = {ownShip: {}, targets: {}};

    /**
     * Environment state
     * @type {Object}
     */
    $scope.environment = scenario.environment;

    /**
     * Mission objectives
     * @type {Object}
     */
    $scope.objectives = scenario.objectives;

    /**
     * Initial properties properties for vessels
     * @type {Array}
     */
    $scope.vesselsScenario = scenario.vessels;

    /**
     * GeoJson map features
     * @type {Object}
     */
    $scope.mapFeatures = scenario.features;

    /**
     * what the user wishes the ownship vessel to do
     * @type {{course: number, speed: number}}
     */
    $scope.demandedState = {
        course: 0.00,
        speed: 1
    };

    /**
     * Current state of game
     * @type {Object}
     */
    $scope.gameState = {
        state: 'DO_STOP',
        accelRate: 0,
        simulationTime: 0,
        simulationTimeStep: 2000,
        patrolArea: scenario.patrolArea
    };
}])

/**
 * @module Game
 * @class MissionCtrl (controller)
 */
.controller('MissionSimulatorCtrl', ['$scope', '$interval', '$q', 'geoMath', 'movement', 'decision', 'objectives', 'detection',
        function ($scope, $interval, $q, geoMath, movement, decision, objectives, detection) {

    var gameAccelRateIntervalId;

    /**
     * Create config object for a vessel marker
     * @param {String} layerName Layer name
     * @param {Object} vessel
     * @returns {Object}
     */
    var vesselMarker = function (layerName, vessel) {
        return _.extend(vessel, {
            lat: vessel.state.location ? vessel.state.location.lat : 0,
            lng: vessel.state.location ? vessel.state.location.lng : 0,
            focus: false,
            message: vessel.name,
            layer: layerName,
            iconAngle: vessel.state.course
        });
    };

    var initializeTargetShips = function () {
        var deferred = $q.defer();

        var targets = _.each($scope.vesselsState.targets, function (targetShip) {
            // see if the target has a location
            if (!targetShip.state.location) {

                // cool, generate one - up to 10 miles from v1
                var direction = Math.random() * 360;
                var range = 2000 + Math.random() * 20000;

                if ($scope.gameState.patrolArea) {
                    var pBounds = L.latLngBounds($scope.gameState.patrolArea);
                    targetShip.state.location = geoMath.rhumbDestinationPoint(pBounds.getCenter(),
                        geoMath.toRads(direction), range);
                } else {
                    targetShip.state.location = geoMath.rhumbDestinationPoint($scope.ownShip.state.location,
                        geoMath.toRads(direction), range);
                }
            }

            if (!targetShip.state.course) {
                var newCourse = Math.random() * 360;
                targetShip.state.course = newCourse;
                targetShip.state.demCourse = newCourse;
            }

            if (!targetShip.state.speed) {
                var newSpeed = 6 + Math.random() * 8;
                targetShip.state.speed = newSpeed;
                targetShip.state.demSpeed = newSpeed;
            }
        });

        $scope.gameState.state = 'RUNNING';

        deferred.resolve();
        return deferred.promise;
    };

    var shareSonarDetections = function () {
        // share the good news about detections
        var detections;
        var thisB;

        _.each($scope.vesselsState.ownShip.newDetections, function (detection) {
            // is this the first item?
            if (!detections) {
                detections = [new Date(detection.time)];
            }

            thisB = detection.bearing;

            // clip to +/- 180
            if (thisB > 180) {
                thisB -= 360;
            }

            // add this detection to the list
            detections.push(thisB);
        });

        // did we find any?
        if (detections) {
            $scope.$broadcast('addDetections', detections);
        }
    };

    var missionStatus = function () {
        // do we need to pause/stop?
        if (($scope.gameState.state === 'DO_PAUSE') || ($scope.gameState.state === 'DO_STOP')) {
            // scenario complete?
            if ($scope.gameState.successMessage) {
                $scope.gameState.state = 'SUCCESS';
                alert($scope.gameState.successMessage);
                delete $scope.gameState.successMessage;
            } else if ($scope.gameState.failureMessage) {
                $scope.gameState.state = 'FAILED';
                alert($scope.gameState.failureMessage);
                delete $scope.gameState.failureMessage;
            }

            // are there any achievements?
            if($scope.gameState.achievements)
            {
                var showIt = function(element){
                    alert("New achievement:" + element.name +" message:" + element.message);
                };
                _.each($scope.gameState.achievements, showIt);
            }

            if ($scope.gameState.state === 'DO_PAUSE') {

                // ok, resume
                $scope.gameState.state = 'RUNNING';

            } else if (($scope.gameState.state === 'DO_STOP') || ($scope.gameState.state === 'FAILED')) {
                // ok, move on to the review stage
                var r = confirm("Ready for the debriefing?");
                if (r == true) {
                    alert("switch to the new route");
                } else {
                    alert("let the user view/pan/zoom the plot");
                }
            }
        }
    };

    var updateMapMarkers = function () {
        vesselMarker('ownShip', $scope.vesselsState.ownShip);
        _.map($scope.vesselsState.targets, function (vessel) {
            return vesselMarker(vessel.layer, vessel)
        });

        $scope.vesselsMarker = _.extend(_.pick($scope.vesselsState, 'ownShip'), $scope.vesselsState.targets);
        $scope.$broadcast('vesselsStateUpdated');
    };

    var configureMap = function () {
        angular.extend($scope, {
            mapCenter: {
                lat: $scope.vesselsState.ownShip.lat,
                lng: $scope.vesselsState.ownShip.lng,
                zoom: 9
            },
            layers: {
                baselayers: {
                    map: {
                        name: 'map',
                        type: 'xyz',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                },
                overlays: {
                    ownShip: {
                        type: 'group',
                        name: 'ownShip',
                        visible: true
                    },
                    targets: {
                        type: 'group',
                        name: 'targets',
                        visible: false
                    }
                }
            },
            vesselsMarker: {},
            paths: {}
        });
    };

    var doStep = function () {
        $scope.vesselsState.ownShip.state.demCourse = parseInt($scope.demandedState.course);
        $scope.vesselsState.ownShip.state.demSpeed = parseInt($scope.demandedState.speed);

        /////////////////////////
        // GAME LOOP STARTS HERE
        /////////////////////////

        // move the scenario forward
        $scope.gameState.simulationTime += $scope.gameState.simulationTimeStep;

        // loop through the vessels
        movement.doMove($scope.gameState.simulationTime, $scope.vesselsState.ownShip.state, $scope.vesselsState.ownShip.perf);
        _.each($scope.vesselsState.targets, function (vessel) {
            movement.doMove($scope.gameState.simulationTime, vessel.state, vessel.perf);
        });

        // now that everyone is in their new location, do the detections
        detection.doDetections($scope.gameState.simulationTime, $scope.vesselsState.ownShip, $scope.vesselsState.targets);

        // and now the decisions
        _.each($scope.vesselsState.targets, function (vessel) {
            decision.doDecisions($scope.gameState.simulationTime, vessel.state, vessel.newDetections, vessel.behaviours);
        });

        // let the referees run
        objectives.doObjectives($scope.gameState, $scope.objectives, $scope.vesselsState);

        // update the UI
        shareSonarDetections();
        missionStatus();
        updateMapMarkers();

        /////////////////////////
        // GAME LOOP ENDS HERE
        /////////////////////////
    };

    $scope.vesselsState.ownShip = vesselMarker('ownShip', _.first($scope.vesselsScenario));

    // Target vessels marker
    _.each(_.rest($scope.vesselsScenario), function (vessel) {
        $scope.vesselsState.targets[vessel.name] = vesselMarker('targets', vessel);
    });

    initializeTargetShips().then(function () {
        configureMap();

        $scope.demandedState.course = parseInt($scope.vesselsState.ownShip.state.demCourse);
        $scope.demandedState.speed = parseInt($scope.vesselsState.ownShip.state.demSpeed);
    });

    $scope.$watch('gameState.accelRate', function (newVal) {
        $interval.cancel(gameAccelRateIntervalId);

        if (newVal) {
            // do play
            gameAccelRateIntervalId = $interval(doStep, 1000 / $scope.gameState.accelRate);
        }
    });
}])

/**
 * @module Game
 * @class TrainingCtrl (controller)
 */
.controller('TrainingSimulatorCtrl', ['$scope', function ($scope) {

}]);
