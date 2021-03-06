/**
 * @module Plot Graphs
 *
 * Creates plot with one (live) sonar graph
 * Or several graphs (live sonar plus sonars with time offset to show historical detections)
 */

angular.module('subtrack90.game.plotGraphs', ['subtrack90.game.sonarGraph'])

/**
 * @module Plot Graphs
 * @class Service
 * @description Plot sonar graphs
 */

.service('plotGraphs', ['sonarGraph', function (sonarGraph) {
    var config = {
        sonarElement: null,
        graphs: [],
        colors : {
            indicator: "#aace00",
            heading: "#1A68DB"
        }
    };

    var seriesStack = [];

    var $sonarElement = null;
    var sonarGraphs;

    init();

    /**
     * Configure plot.
     *
     * @param {Object} options
     * @returns {Object} Service instance
     */
    this.setup = function (options) {
        config = _.extend(config, options);
        $sonarElement = $(config.sonarElement);
        sonarGraphs = [];

        _.map(config.graphs, function (graph) {
            graph.element = $(graph.element);
            graph.timeLatency = graph.duration * 60 * 1000; // milliseconds
        });

        fitGraphsHeight();

        return this;
    };

    /**
     * Create plot.
     *
     * @param {Object} options
     */
    this.createPlot = function () {
        _.each(config.graphs, function (graph) {
            var sonarConfig = {
                containerElement: graph.element.get(-1),
                yTicks: graph.yTicks,
                yDomainDensity: graph.duration,
                detectionPointRadii: graph.detectionPointRadii,
                yAxisLabel: graph.yAxisLabel,
                showXAxis: graph.showXAxis,
                margin: graph.margin,
                elementSize: graphDimension(graph.element),
                detectionSelect: config.detectionSelect,
                initialTime: config.initialTime
            };

            var graph = sonarGraph.build(sonarConfig);
            sonarGraphs.push(graph);
        });
    };

    /**
     * Add detections to plot.
     *
     * @param {Object} series
     */
    this.addDetection = function (series) {
        var lastDetectionTime;

        _.each(sonarGraphs, function (sonar, index) {
            if (index > 0) {
                if (lastDetectionTime > config.graphs[index - 1].timeLatency) {
                    // a graph with historical data is ready to be rendered
                    sonar.addDetection(seriesStack.shift());
                } else {
                    // detection can't be rendered because its date is within live-time fragment
                    // just update time axis on the graph
                    var detectionsForAxis = _.map(series, fixTime);
                    sonar.changeYAxisDomain(detectionsForAxis);
                }
            } else {
                // add detection to the graph with live data
                sonar.addDetection(series);

                // add detection to the cached stack
                seriesStack.push(series);
                lastDetectionTime = series[0].date.getTime();
            }
        });
    };

    /**
     * Update current time in plot
     *
     * @param {Date} Time
     */
    this.updatePlotTime = function (time) {
        _.each(sonarGraphs, function (sonar) {
            sonar.changeYAxisDomain(time);
        });
    };

    /**
     * Initialise service
     *
     */
    function init() {
        $(window).on('resize', resizeWindowHandler);
    }

    /**
     * Set graph height in plot
     *
     */
    function fitGraphsHeight() {
        var height = $sonarElement.height();

        _.each(config.graphs, function (graph) {
            graph.element.height(Math.floor(graph.height * height));
        });
    }

    /**
     * Get height and width of element
     *
     * @return {Object} element dimension
     */
    function graphDimension($element) {
        return {
            height: $element.height(),
            width: $element.width()
        };
    }

    /**
     * Change date in detection according to time latency of a previous graph
     *
     * @return {Object} detection
     */
    function fixTime(detection) {
        var detection = _.extend({}, detection); // "copy" object
        var time = detection.date.getTime() - _.first(config.graphs).timeLatency;
        detection.date = new Date(time);
        return detection;
    }

    /**
     * Resize window handler.
     *
     */
    function resizeWindowHandler() {
        fitGraphsHeight();

        _.each(sonarGraphs, function (sonar, index) {
            sonar.changeGraphHeight(graphDimension(config.graphs[index].element));
        });
    }
}]);
