/**
 * Created by ian on 14/02/14.
 */
scenarios.scenario1a = {
    "vessels": [
        {
            "name": "Ownship",
            "categories": ["BLUE", "SURFACE", "WARSHIP"],
            "behaviours": [],
            "sonars": [
            ],
            "radiatedNoise": {
                "baseLevel": 90,
                "speedPattern": "Uniform"
            },
            "state": {
                "time": 0,
                "categories": [],
                "location": {"lat": 50, "lng": -8.2},
                "height": 0,
                "course": 145,
                "speed": 10,
                "demCourse": 145,
                "demSpeed": 10,
                "demHeight": -10.0
            },
            "perf": {
                "turnRadius": 1200.0,
                "accelerationRate": 0.3,
                "decelerationRate": 0.8,
                "minSpeed": 0,
                "maxSpeed": 40,
                "climbRate": 1,
                "diveRate": 2
            }
        }
    ],
    "patrolArea": [
        [50.15, -8.25],
        [49.85, -7.75]
    ],
    "environment": {},
    "objectives": [
        {"name": "Reach Targets", "type": "SEQUENCE", "children": [
            {"name": "Point A", type: "PROXIMITY", "location": {"lat":50,"lng": -8.06}, "range": 2000,
                "success": "Ok checks done. Sorry they took so long. Let's get that array fitted. We're running a bit late, so you need to within 1km of the barge (about 20 miles North of here) carrying your array within 30 mins. " +
                    "You must be doing approx North course at under 3 knots for the transfer to happen.  " +
                    "There's quite a rush, you'll probably need to travel at about 20 knots"},
            {"name": "Point B", type: "PROXIMITY", "location": {"lat":50.2,"lng": -8.20}, "range": 1000,
                "elapsed": 1800, "course:":0, "courseError":10, "maxSpeed":3, "success": "Well done, you made it. Let's get the array fitted and move on",
                "failure": "Sorry, you didn't make it in time. You'll have to restart this mission"}
        ]}
    ],
    "welcome" : "Let's start you off on a tracked range. " +
        "We've got a training array for you, but first we need go through your noise checks. To do this, travel within 2 km of the Survey Vessel (directly East of you). " +
        "\nYou're going to have to press the Play ('>') button in the Time controls, you may also wish to use +/- buttons to speed up or slow down the time. " +
        "\nYou will also have to steer to the correct course using the 'Demanded' course control (+5/-5)",
    "features": {
        "type": "FeatureCollection", "features": [
            {"type": "Feature",
                "properties": {"name": "Ops Area"},
                "geometry": {"type": "Point", "coordinates": [-8.06, 50]

                }, "id": "DestinationA"},
            {"type": "Feature",
                "properties": {"name": "Ops Area"},
                "geometry": {"type": "Point", "coordinates": [-8.20, 50.2]
                }, "id": "DestinationB"}
        ]
    }
};