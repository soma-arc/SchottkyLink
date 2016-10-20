const PRESET_PARAMETERS = [
    {
        "name": "FourCircles",
        "generators": {
            "Circles": [
                {
                    "position": [100, -100],
                    "radius": 100
                },
                {
                    "position": [100, 100],
                    "radius": 100
                },
                {
                    "position": [-100, -100],
                    "radius": 100
                },
                {
                    "position": [-100, 100],
                    "radius": 100
                }
            ]
        }
    },
    {
        "name": "Apollonian",
        "generators": {
            "Circles": [
                {
                    "position": [400, 400],
                    "radius": 400
                },
                {
                    "position": [-400, 400],
                    "radius": 400
                },
                {
                    "position": [0, 100],
                    "radius": 100
                },
            ],
            "InfiniteCircles": [
                {
                    "position": [0, 0],
                    "rotation": 90
                }
            ]
        }
    },
    {
        "name": "Translation",
        "generators": {
            "Circles": [
                {
                    "position": [100, -100],
                    "radius": 100
                },
                {
                    "position": [100, 100],
                    "radius": 100
                },
                {
                    "position": [-100, -100],
                    "radius": 100
                },
                {
                    "position": [-100, 100],
                    "radius": 100
                }
            ],
            "InfiniteCircles": [
                {
                    "position": [200, 0],
                    "rotation": 0
                },
                {
                    "position": [-200, 0],
                    "rotation": 180
                }
            ]
        }
    },
    {
        "name": "Parabolic",
        "generators": {
            "Circles": [
                {
                    "position": [226, -139],
                    "radius": 108
                },
                {
                    "position": [263, 106],
                    "radius": 100
                },
                {
                    "position": [47, -209],
                    "radius": 78
                },
                {
                    "position": [93, 200],
                    "radius": 95
                },
                {
                    "position": [154, 4],
                    "radius": 53
                }
            ],
            "TransformByCircles": [
                {
                    "innerCircle": {
                        "position": [-50,0],
                        "radius": 150
                    },
                    "outerCircle": {
                        "position": [0,0],
                        "radius": 200
                    }
                }
            ]
        }
    },
    {
        "name": "Loxodromic",
        "generators": {
            "Circles": [
                {
                    "position": [-161, 132],
                    "radius": 61
                },
                {
                    "position": [200, 65],
                    "radius": 66
                },
                {
                    "position": [30, -203],
                    "radius": 48
                },
                {
                    "position": [169, -119],
                    "radius": 55
                },
                {
                    "position": [-185, -90],
                    "radius": 50
                },
                {
                    "position": [18, 210],
                    "radius": 68
                }
            ],
            "TransformByCircles": [
                {
                    "innerCircle": {
                        "position": [-4, -7],
                        "radius": 150
                    },
                    "outerCircle": {
                        "position": [0, 0],
                        "radius": 200
                    }

                }
            ]
        }
    },
    {
        "name": "TwistedLoxodromic",
        "generators": {
            "Circles": [
                {
                    "position": [115, 190],
                    "radius": 100
                }
            ],
            "TwistedLoxodromic": [
                {
                    "innerCircle": {
                        "position": [-12, -23],
                        "radius": 150
                    },
                    "outerCircle": {
                        "position": [0, 0],
                        "radius": 200
                    },
                    "point": [100, 10]
                },

            ]
        }
    },
        {
        "name": "TwistedLoxodromic2",
        "generators": {
            "Circles": [
                {
                    "position": [115, 190],
                    "radius": 100
                }
            ],
            "TwistedLoxodromic": [
                {
                    "innerCircle": {
                        "position": [-4, -7],
                        "radius": 150
                    },
                    "outerCircle": {
                        "position": [0, 0],
                        "radius": 200
                    },
                    "point": [100, 10]
                },
                {
                    "innerCircle": {
                        "position": [-704, -107],
                        "radius": 150
                    },
                    "outerCircle": {
                        "position": [-700, -100],
                        "radius": 200
                    },
                    "point": [-400, -100]
                }
            ]
        }
    }
];

const PRESET_PARAMS_OBJECTS = [
    {
        Circles:[new Circle(100, -100, 100),
		 new Circle(100, 100, 100),
		 new Circle(-100, -100, 100),
		 new Circle(-100, 100, 100)],
    },
    {
        Circles:[new Circle(400, 400, 400),
		 new Circle(-400, 400, 400),
		 new Circle(0, 100, 100)],
        InfiniteCircles:[new InfiniteCircle(0, 0, 90)],
    },
    {
        Circles:[new Circle(100, -100, 100),
		 new Circle(100, 100, 100),
		 new Circle(-100, -100, 100),
		 new Circle(-100, 100, 100)],
        InfiniteCircles:[new InfiniteCircle(200, 0, 0),
                         new InfiniteCircle(-200, 0, 180)],
    },
    {
        Circles:[new Circle(226, -139, 108),
                 new Circle(263, 106, 100),
                 new Circle(47, -209, 78),
                 new Circle(93, 200, 95),
                 new Circle(154, 4, 53)],
        TransformByCircles:[new TransformByCircles(new Circle(-50, 0, 150),
                                                   new Circle(0, 0, 200))],
    },
    {
        Circles:[new Circle(-161, 132, 61),
                 new Circle(200, 65, 66),
                 new Circle(30, -203, 48),
                 new Circle(169, -119, 55),
                 new Circle(-185, -90, 50),
                 new Circle(18, 210, 68)],
        TransformByCircles:[new TransformByCircles(new Circle(-4, -7, 150),
                                                   new Circle(0, 0, 200))],
    },
    {
        TwistedLoxodromic:[new TwistedLoxodromic(new Circle(-4, -7, 150),
                                                 new Circle(0, 0, 200),
                                                 [100, 10])],
    },
    {
        TwistedLoxodromic:[new TwistedLoxodromic(new Circle(-4, -7, 150),
                                                 new Circle(0, 0, 200),
                                                 [100, 10]),
                           new TwistedLoxodromic(new Circle(-704, -107, 150),
                                                 new Circle(-700, -100, 200),
                                                 [-400, -100])],
    }
];
