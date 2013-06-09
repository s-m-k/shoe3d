/*global document, window, THREE, shoeApp, jQuery, WebGLHelper*/

(function () {
    'use strict';

    var initConfig = {
        materials: {
            demo1Tie: {
                texture: 'img/textures/demo1/shoeline.jpg',
                bumpMap: 'img/textures/demo1/shoeline_bump.jpg',
                bumpScale: 0.05,
                color: 0xffffff,
                shiniess: 0x666666,
                specular: 0x333333
            },
            demo1Sole: {
                texture: 'img/textures/demo1/sole.jpg',
                color: 0xffffff,
                shiniess: 0x444444,
                specular: 0x333333
            },
            demo1ShoeOuter: {
                texture: 'img/textures/demo1/shoeouter.jpg',
                bumpMap: 'img/textures/demo1/shoeouter_bump.jpg',
                bumpScale: 0.03,
                color: 0x8f553f,
                shiniess: 0x111111,
                specular: 0x444444
            },
            demo1ShoeLine: {
                color: 0xAA7F6D,
                shiniess: 0x000000,
                specular: 0x2a2a2a
            },
            demo1ShoeInner: {
                texture: 'img/textures/demo1/shoeinner.jpg',
                bumpMap: 'img/textures/demo1/shoeouter_bump.jpg',
                bumpScale: 0.01,
                color: 0xffffff,
                shiniess: 0x000000,
                specular: 0x2a2a2a
            },
            demo1ShoeRivet: {
                color: 0xEDCF86,
                shiniess: 0xffffff,
                specular: 0xffffff
            }
        },
        models: {
            'demo1': {
                border: {
                    material: 'demo1ShoeOuter',
                    file: 'border.json'
                },
                rivet: {
                    material: 'demo1ShoeRivet',
                    file: 'rivet.json'
                },
                shoein: {
                    material: 'demo1ShoeInner',
                    file: 'shoein.json'
                },
                shoeline: {
                    material: 'demo1ShoeLine',
                    file: 'shoeline.json'
                },
                shoeout: {
                    material: 'demo1ShoeOuter',
                    file: 'shoeout.json'
                },
                soles: {
                    material: 'demo1Sole',
                    file: 'soles.json'
                },
                ties: {
                    material: 'demo1Tie',
                    file: 'ties.json'
                }
            }
        }
    };

    function startApplication() {
        var oldX = 0, oldY = 0,
            mousePressed = false;

        shoeApp.shoe3D.initialize(initConfig);

        shoeApp.shoe3D.loadModel('demo1', function (layers) {
            shoeApp.colorMenu.update(layers);
        });

        shoeApp.colorMenu.domElement.on('colorchange', function (event) {
            shoeApp.shoe3D.changeLayerColor(event.layerName, event.color);
        });

        jQuery('#shoe-viewer').on('mousedown', function (event) {
            event.preventDefault();
            if (event.button === 0) {
                mousePressed = true;
            }
        });

        jQuery(window).on('mouseup', function (event) {
            if (event.button === 0) {
                mousePressed = false;
            }
        });

        jQuery('#shoe-viewer').on('mousewheel', function (event, delta) {
            event.preventDefault();
            shoeApp.shoe3D.zoom(-delta / 4);
        });

        jQuery(window).on('mousemove', function (event) {
            if (mousePressed) {
                shoeApp.shoe3D.rotateX((event.pageY - oldY) / 500);
                shoeApp.shoe3D.rotateY((event.pageX - oldX) / 500);
            }

            oldX = event.pageX;
            oldY = event.pageY;
        });
    }

    function handleFailure() {
        alert('Zainstaluj plugin IEWebGL!');
    }

    jQuery.ajaxSetup({
        cache: true
    });

    WebGLHelper.CreateGLCanvas(document.getElementById('shoe-viewer'),
            'shoe-canvas', false, function () {
                jQuery.getScript('js/lib/three.js', function () {
                    jQuery.getScript('js/lib/three.postprocessing.js', function () {
                        jQuery.getScript('js/shaders.js', function () {
                            startApplication();
                        });
                    });
                });
            }, handleFailure);

}());