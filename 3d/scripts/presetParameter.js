const PRESET_PARAMETERS = [
    {
        "text": "BaseOnly",
        "generators": {
            "BaseSpheres": [
                {
                    "position": [0, 0, 0],
                    "radius": 125
                }
            ]
        }
    },
    {
        "text": "5Spheres",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [300,300,0],
                    "radius": 300
                },
                {
                    "position": [300,-300,0],
                    "radius": 300
                },
                {
                    "position": [-300,300,0],
                    "radius": 300
                },
                {
                    "position": [-300,-300,0],
                    "radius": 300
                },
                {
                    "position": [0,0,424.26],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [0,0,0],
                    "radius": 125
                }
            ]
        }
    },
    {
        "text": "6Spheres",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [
                        300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        424.26
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        -424.26
                    ],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                }
            ]
        }
    },{
        "text": "3 base spheres",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [
                        300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        819.6152422706632,
                        0,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -819.6152422706632,
                        0,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        424.26
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        -424.26
                    ],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                },
                {
                    "position": [
                        473.2050807568877,
                        0,
                        0
                    ],
                    "radius": 50
                },
                {
                    "position": [
                        -473.2050807568877,
                        0,
                        0
                    ],
                    "radius": 50
                }
            ]
        }
    },
    {
        "text": "InfinitePlane",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [300,300,0],
                    "radius": 300
                },
                {
                    "position": [300,-300,0],
                    "radius": 300
                },
                {
                    "position": [-300,300,0],
                    "radius": 300
                },
                {
                    "position": [0,0,-424.26],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [0,0,0],
                    "radius": 125
                }
            ],
            "InfiniteSpheres": [
                {
                    "center": [0,0,150],
                    "thetaDegree": 0,
                    "phiDegree": 0
                }
            ]
        }
    },
    {
        "text": "Rotation",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [300,300,0],
                    "radius": 300
                },
                {
                    "position": [300,-300,0],
                    "radius": 300
                },
                {
                    "position": [-300,300,0],
                    "radius": 300
                },
                {
                    "position": [0,0,424.26],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [0,0,0],
                    "radius": 125
                }
            ],
            "InfiniteSpheres": [
                {
                    "center": [0,600,-300],
                    "thetaDegree": 90,
                    "phiDegree": 0
                },
                {
                    "center": [0,600,-300],
                    "thetaDegree": 180,
                    "phiDegree": 0
                }
            ]
        }
    },
    {
        "text": "ParallelTranslation",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [
                        300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        424.26
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        -424.26
                    ],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                }
            ],
            "TransformByPlanes": [
                {
                    "distToP1": -300,
                    "distToP2": 300,
                    "thetaDegree": 0,
                    "phiDegree": 0,
                    "twistDegree": 0
                }
            ]
        }
    },
    {
        "text": "ParabolicOneSphere",
        "generators": {
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                }
            ],
            "Parabolic": [
                {
                    "outerSphere": {
                        "position": [
                            0,
                            665,
                            472
                        ],
                        "radius": 660
                    },
                    "innerRadius": 500,
                    "thetaDegree": 90,
                    "phiDegree": 90
                }
            ]
        }
    },
    {
        "text": "Parabolic",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [
                        300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        424.26
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        -424.26
                    ],
                    "radius": 300
                }
            ],
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                }
            ],
            "TransformBySpheres": [
                {
                    "innerSphere": {
                        "position": [
                            0,
                            665.0462361544822,
                            633.2648594288207
                        ],
                        "radius": 500
                    },
                    "outerSphere": {
                        "position": [
                            0,
                            665.0462361544822,
                            472.1829455752595
                        ],
                        "radius": 661.0819138535611
                    }
                }
            ]
        }
    },
    {
        "text": "ModParabolic",
        "generators": {
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                }
            ],
            "SchottkySpheres": [
                {
                    "position": [
                        300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        424.26
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        -424.26
                    ],
                    "radius": 300
                }
            ],
            "Parabolic": [
                {
                    "outerSphere": {
                        "position": [
                            0,
                            665,
                            472
                        ],
                        "radius": 660
                    },
                    "innerRadius": 500,
                    "thetaDegree": 90,
                    "phiDegree": 90
                }
            ]
        }
    },
    {
    "text": "CompoundLoxodromicOneSphere",
        "generators": {
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 62.5
                }
            ],
            "CompoundLoxodromic": [
                {
                    "innerSphere": {
                        "position": [
                            10,
                            161.06500713368246,
                            645.8279011704013
                        ],
                        "radius": 566.9624916386372
                    },
                    "outerSphere": {
                        "position": [
                            100,
                            211.06500713368246,
                            666.1807953962565
                        ],
                        "radius": 700
                    },
                    "point": [
                        0,
                        1111.0650071336825,
                        -133.81920460374351
                    ],
                    "q1": [
                        100,
                        -888.9349928663175,
                        -133.81920460374351
                    ],
                    "q2": [
                        1000,
                        111.06500713368246,
                        -143.81920460374351
                    ]
                }
            ]
        }
    },
    {
    "text": "CompoundLoxodromic",
        "generators": {
            "SchottkySpheres": [
                {
                    "position": [
                        150,
                        150,
                        0
                    ],
                    "radius": 150
                },
                {
                    "position": [
                        150,
                        -150,
                        0
                    ],
                    "radius": 150
                },
                {
                    "position": [
                        -150,
                        150,
                        0
                    ],
                    "radius": 150
                },
                {
                    "position": [
                        -150,
                        -150,
                        0
                    ],
                    "radius": 150
                },
                {
                    "position": [
                        0,
                        0,
                        212.13
                    ],
                    "radius": 150
                },
                {
                    "position": [
                        0,
                        0,
                        -212.13
                    ],
                    "radius": 150
                }
            ],
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 62.5
                }
            ],
            "CompoundLoxodromic": [
                {
                    "innerSphere": {
                        "position": [
                            10,
                            161.06500713368246,
                            645.8279011704013
                        ],
                        "radius": 566.9624916386372
                    },
                    "outerSphere": {
                        "position": [
                            100,
                            211.06500713368246,
                            666.1807953962565
                        ],
                        "radius": 700
                    },
                    "point": [
                        0,
                        1111.0650071336825,
                        -133.81920460374351
                    ],
                    "q1": [
                        100,
                        -888.9349928663175,
                        -133.81920460374351
                    ],
                    "q2": [
                        1000,
                        111.06500713368246,
                        -143.81920460374351
                    ]
                }
            ]
        }
    },
    {
        "text": "ModLoxodromic",
        "generators": {
            "BaseSpheres": [
                {
                    "position": [
                        0,
                        0,
                        0
                    ],
                    "radius": 125
                }
            ],
            "SchottkySpheres": [
                {
                    "position": [
                        300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        -300,
                        -300,
                        0
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        424.26
                    ],
                    "radius": 300
                },
                {
                    "position": [
                        0,
                        0,
                        -424.26
                    ],
                    "radius": 300
                }
            ],
            "Loxodromic": [
                {
                    "innerSphere": {
                        "position": [
                            0,
                            534.8585047919469,
                            450.74556686171746
                        ],
                        "radius": 483.6804628203588
                    },
                    "outerSphere": {
                        "position": [
                            0,
                            521.3088684554643,
                            489.74556686171746
                        ],
                        "radius": 660
                    }
                }
            ]
        }
    },
    {
        "text": "ModCompoundLoxodromic",
	    "generators": {
            "SchottkySpheres": [
		        {
                    "position": [
			            300,
			            300,
			            0
                    ],
                    "radius": 300
		        },
		        {
                    "position": [
			            300,
			            -300,
			            0
                    ],
                    "radius": 300
		        },
		        {
                    "position": [
			            -300,
			            300,
			            0
                    ],
                    "radius": 300
		        },
		        {
                    "position": [
			            -300,
			            -300,
			            0
                    ],
                    "radius": 300
		        },
		        {
                    "position": [
			            0,
			            0,
			            424.26
                    ],
                    "radius": 300
		        },
		        {
                    "position": [
			            0,
			            0,
			            -424.26
                    ],
                    "radius": 300
		        }
            ],
            "BaseSpheres": [
		        {
                    "position": [
			            0,
			            0,
			            0
                    ],
                    "radius": 125
		        }
            ],
            "ModCompoundLoxodromic": [
		        {
                    "innerSphere": {
			            "position": [
                            10,
                            50,
                            664.3523402015614
			            ],
			            "radius": 476.843462824442
                    },
                    "outerSphere": {
			            "position": [
                            100,
                            100,
                            684.7052344274166
			            ],
			            "radius": 700
                    },
                    "point": [
			            0,
			            1000,
			            -115.2947655725834
                    ],
                    "q1": [
			            100,
			            -1000,
			            -115.2947655725834
                    ],
                    "q2": [
			            1000,
			            0,
			            -125.2947655725834
                    ]
		        }
            ]
	    }
    },
];

const PRESET_PARAM_OBJECTS = [
    {
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
        CompoundParabolic:[new CompoundParabolic(new Sphere(0, 0, 1000, 500),
                                                 new Sphere(0, 0, 900, 600),
                                                 0)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
        CompoundLoxodromic:[new CompoundLoxodromic(new Sphere(10, 50, 900, 400),
                                                   new Sphere(100, 100, 900, 700),
                                                   [0, 1000, 100],
                                                   [100, -1000, 100],
                                                   [1000, 0, 90])]
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                        ],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
        InfiniteSpheres:[new InfiniteSphere([0, 0, 150], 0, 0)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                        ],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(300 + 300. * Math.sqrt(3), 0, 0, 300),
                         new Sphere(-300 - 300 * Math.sqrt(3), 0, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300),
                        ],
        BaseSpheres:[new Sphere(0, 0, 0, 125),
                     new Sphere(300 + 100 * Math.sqrt(3), 0, 0, 50),
                     new Sphere(-300 -100 * Math.sqrt(3), 0, 0, 50)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
        TransformBySpheres: [],
        TransformByPlanes:[new TransformByPlanes(-300, 300, 0, 0, 0)],
    },
    {
        SchottkySpheres:[new Sphere(300, 300, 0, 300),
                         new Sphere(300, -300, 0, 300),
                         new Sphere(-300, 300, 0, 300),
                         new Sphere(-300, -300, 0, 300),
                         new Sphere(0, 0, 424.26, 300),
                         new Sphere(0, 0, -424.26, 300)],
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
        TransformBySpheres:[new TransformBySpheres(new Sphere(0, 0, 1000, 500),
                                                   new Sphere(0, 0, 900, 600))],
    },
    {
        BaseSpheres:[new Sphere(0, 0, 0, 125)],
        TransformBySpheres:[new TransformBySpheres(new Sphere(0, 0, 1000, 500),
                                                   new Sphere(0, 0, 900, 600))],
        TransformByPlanes:[new TransformByPlanes(-300, 300, 0, 0, 0)],
    }
    
];
