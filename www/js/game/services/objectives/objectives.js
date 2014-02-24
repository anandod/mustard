/**
 * @module Objectives
 */

angular.module('mustard.game.objectives', ['mustard.game.geoMath'])

/**
 * @module Objectives
 * @class Service
 * @description Game objectives
 */

.service('objectives', ['geoMath', function (geoMath) {

    var handleThis = function (gameState, objective, scenario) {
        var thisType = objective.type;
        var res;

        switch (thisType) {
            case "SEQUENCE":

                var thisId = 0;
                var STOP_CHECKING = false;  // flag for if an object hasn't been reached yet

                // loop through all, or until we don't get a result object
                do
                {
                    // get the next child
                    var child = objective.children[thisId];

                    // is this one complete?
                    if (!(child.complete)) {
                        // ok, run it
                        handleThis(gameState, child, scenario);

                        // did it finish?
                        if (child.complete) {
                            // OK. For a sequence we have to override the game state setting.
                            // this is because a STOP is actually a PAUSE if we're not at the last one yet.

                            // is this the last one?  If it's not we  will switch
                            // a stop instruction to a pause one
                            if (((thisId + 1) == objective.children.length) || (gameState.failureMessage)) {
                                // ok, this is the last one. we can do an actual stop
                                gameState.state = "DO_STOP";
                            }
                            else {
                                gameState.state = "DO_PAUSE";
                            }
                        }
                        else {
                            // that one isn't ready. move on
                            STOP_CHECKING = true;
                        }
                    }
                    else {
                        // don't worry - move on the next one
                    }

                    // move to the next child
                    thisId++;
                }
                while ((thisId < objective.children.length) && (!STOP_CHECKING))

                // Blah
                break;
            case "PROXIMITY":
                handleProximity(gameState, objective, scenario);
                break;
            case "GAIN_CONTACT":
                handleGainContact(gameState, objective, scenario);
                break;
            case "MAINTAIN_CONTACT":
                handleMaintainContact(gameState, objective, scenario);
                break;


        }
    };

    var handleMaintainContact = function (gameState, maintainContact, scenario) {

        // ok, have we gained contact on someone other than us
        var ownship = scenario;
        var detections = ownship.newDetections;

        var inContact;

        if (detections && detections.length > 0) {

            // ok, are any from a target?
            for (var i = 0; i < detections.length; i++) {
                var thisD = detections[i];

                if (thisD.source != ownship.name) {

                    inContact = true;

                    // is this our first one?
                    if (!maintainContact.stopTime) {
                        maintainContact.stopTime = gameState.tNow + (maintainContact.elapsed * 1000);
                    }

                    // have we held contact for long enough
                    if (gameState.tNow >= maintainContact.stopTime) {
                        // great - we're done.
                        maintainContact.complete = true;
                        break;
                    }
                }
            }
        }

        // did we just finish?
        if (maintainContact.complete) {
            // cool,handle the success
            gameState.successMessage = maintainContact.success;
            gameState.state = "DO_STOP";
            maintainContact.complete = true;
        }

        if (!maintainContact.complete && ((maintainContact.stopTime && !inContact) || (gameState.tNow > maintainContact.stopTime))) {
            // ok, game failure
            maintainContact.complete = true;

            // how many minutes did we trail for?
            var elapsedMins = (gameState.tNow - (maintainContact.stopTime - (maintainContact.elapsed * 1000))) / 1000 / 60;

            // inject the elapsed time message
            var failMessage = maintainContact.failure;
            failMessage = failMessage.replace("[time]", "" + Math.floor(elapsedMins));
            gameState.failureMessage = failMessage;
            gameState.state = "DO_STOP";
        }
    };

    var handleGainContact = function (gameState, gainContact, scenario) {
        if (!gainContact.stopTime) {
            gainContact.stopTime = gameState.tNow + gainContact.elapsed * 1000;
        }

        // ok, have we gained contact on someone other than us
        var ownship = scenario;
        var detections = ownship.newDetections;

        if (detections && detections.length > 0) {
            // ok, are any from a target?
            for (var i = 0; i < detections.length; i++) {
                var thisD = detections[i];

                if (thisD.source != ownship.name) {
                    gainContact.complete = true;
                    // great - we're done.
                    break;
                }
            }
        }

        if (gainContact.complete) {
            // cool,handle the success
            gameState.successMessage = gainContact.success;
            gameState.state = "DO_STOP";
        }

        if (!gainContact.complete) {

            if (gameState.tNow > gainContact.stopTime) {
                // ok, game failure
                gainContact.complete = true;
                gameState.failureMessage = gainContact.failure;
                gameState.state = "DO_STOP";
            }
        }

    };

    var handleProximity = function (gameState, proximity, scenario) {
        // right, do we have an elapsed time limit
        if (proximity.elapsed) {
            // ok. do we know when this objective started?
            if (!proximity.stopTime) {
                // no, better store it
                proximity.stopTime = gameState.tNow + (proximity.elapsed * 1000);
            }
        }
        // ok, where has he got to get to?
        var dest = proximity.location;

        // where is v1
        var current = scenario.state.location;

        // what's the range?
        var range = geoMath.rhumbDistanceFromTo(dest, current);

        if (range < proximity.range) {

            var failed = false;

            // do we have anything else to check?
            if (proximity.hasOwnProperty('course')) {
                // what is o/s course?
                var osCourse = scenario.state.course;

                var courseError = osCourse - proximity.course;

                // trim to acceptable values
                courseError = courseError % 360;

                if (courseError > proximity.courseError) {
                    failed = true;
                }
            }

            // ok, have we failed?
            if (proximity.maxSpeed) {
                var osSpeed = scenario.state.speed;

                if (osSpeed > proximity.maxSpeed) {
                    failed = true;
                }
            }

            // are we ok so far?
            if (!failed) {
                proximity.complete = true;
                gameState.successMessage = proximity.success;
                gameState.state = "DO_STOP";
            }
        }


        // right, just check if we have failed to reach our proximity in time
        if (proximity.stopTime) {
            if (gameState.tNow > proximity.stopTime) {
                // did we succeed on this step
                if (proximity.complete) {
                    // ok, let's allow the success
                }
                else {
                    // ok, game failure
                    proximity.complete = true;
                    gameState.failureMessage = proximity.failure;
                    gameState.state = "DO_STOP";
                }
            }
        }
    };

    /**
     * Module API
     */
    return {
        /**
         *
         * @param tNow the current time
         * @param objectives the array of objectives
         * @param scenario the current scenario state
         */
        doObjectives: function (gameState, objectives, scenario) {

            // ok, loop through the objectives
            _.each(objectives, function (item) {
                handleThis(gameState, item, scenario)
            });
        }
    }
}]);