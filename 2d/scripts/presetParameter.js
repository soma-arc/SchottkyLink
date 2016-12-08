const PRESET_PARAMETERS = [
    {
        "text": "FourCircles",
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
        "text": "Apollonian",
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
        "text": "Translation",
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
        "text": "Parabolic",
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
        "text": "ParabolicMod",
        "generators": {
            "Parabolic": [
                {
                    "OuterCircle": {
                        "position": [0, 0],
                        "radius": 200
                    },
                    "ContactDegree": 0,
                    "InnerRadius": 150
                }
            ]
        }
    },
    {
        "text": "Loxodromic",
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
        "text": "TwistedLoxodromic",
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
	    "text": "TwistedLoxodromic2",
	    "generators": {
            "Circles": [
		        {
                    "position": [
			            115,
			            190
                    ],
                    "radius": 100
		        },
		        {
                    "position": [
			            212.4926108374384,
			            34.67980295566505
                    ],
                    "radius": 83.38258580844379
		        },
		        {
                    "position": [
			            -66.2068965517243,
			            203.66502463054186
                    ],
                    "radius": 81.72141386215503
		        },
		        {
                    "position": [
			            -170.8768472906405,
			            111.60591133004928
                    ],
                    "radius": 57.67255634229849
		        },
		        {
                    "position": [
			            179.7044334975369,
			            -104.0394088669949
                    ],
                    "radius": 59.15893200995475
		        },
		        {
                    "position": [
			            107.82266009852219,
			            -173.39901477832495
                    ],
                    "radius": 40.72972740222431
		        },
		        {
                    "position": [
			            39.724137931034534,
			            -197.35960591132988
                    ],
                    "radius": 31.46112138651651
		        },
		        {
                    "position": [
			            -204.92610837438428,
			            13.241379310344996
                    ],
                    "radius": 46.41842952969897
		        },
		        {
                    "position": [
			            -191.0541871921182,
			            -63.68472906403926
                    ],
                    "radius": 31.748419881765187
		        }
            ],
            "TwistedLoxodromic": [
		        {
                    "innerCircle": {
			            "position": [
				            -12,
				            -23
			            ],
			            "radius": 150
                    },
                    "outerCircle": {
			            "position": [
                            0,
                            0
			            ],
			            "radius": 200
                    },
                    "point": [
			            -358.5221674876849,
			            -79.35960591132982
                    ]
		        }
            ]
	    }
    }
    ,
    {
        "text": "TwistedLoxodromicFromFixedPoints",
        "generators": {
            "Circles": [
                {
                    "position": [457, -230],
                    "radius": 90
                }
            ],
            "TwistedLoxodromicFromFixedPoints": [
                {
                    "fixedPoint1": [241, -41],
                    "fixedPoint2": [-200, 100],
                    "point": [0, 42],
                    "q1":[157, 61],
                    "q2":[133, -59]
                },
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
