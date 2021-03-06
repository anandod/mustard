/**
 * @module subtrack90.game.clickRepeat
 */

angular.module('subtrack90.game.clickRepeat', [])

/**
 * Click & Repeat directive
 *
 * @example <... click-repeat="handler()" [delay="1000" speedup="1.5"] >
 */
.directive('clickRepeat', ['$timeout', 'IS_MOBILE', function ($timeout, IS_MOBILE) {

    return {
        restrict: 'A',

        scope: {
            clickRepeat: '&',
            delay: '=',
            speedup: '='
        },

        link: function (scope, element) {

            /**
             * Action timer promise
             *
             * @type {promise}
             */
            var timer;

            /**
             * Default delay
             *
             * @type {Number} in ms
             */
            var defaultDelay = scope.delay || 300;

            /**
             * Acceleration rate
             *
             * @type {Number}
             */
            var speedup = scope.speedup || 1.03;

            /**
             * Delay which is used in action timer
             *
             * @type {Number} in ms
             */
            var delay = defaultDelay;

            /**
             * Recursive action repeater
             */
            var repeat = function () {
                scope.clickRepeat();
                timer = $timeout(repeat, delay);
                delay /= speedup;
            };

            /**
             * Reset action repeater and delay value of action timer
             */
            var cancelRepeating = function () {
                delay = defaultDelay;
                $timeout.cancel(timer);
            };

            element.bind(IS_MOBILE ? 'touchstart' : 'mousedown', repeat);
            element.bind(IS_MOBILE ? 'touchend touchleave touchcancel' : 'mouseup mouseleave', cancelRepeating);
        }
    };
}]);
