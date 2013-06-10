/*global document, window, THREE, shoeApp, jQuery, WebGLHelper*/

(function () {
    'use strict';

    var initConfig = {
        flashMaterial: {
            color: 0xffffff
        },
        materials: {
            demo1Tie: {
                texture: 'img/textures/demo1/shoeline.jpg',
                bumpMap: 'img/textures/demo1/shoeline_bump.jpg',
                bumpScale: 0.05,
                color: 0xffffff,
                shiniess: 0x666666,
                specular: 0x333333
            },
            demo1Tie2: {
                texture: 'img/textures/demo1/shoeline2.jpg',
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
            demo1ShoeOuter2: {
                texture: 'img/textures/demo1/shoeouter.jpg',
                bumpMap: 'img/textures/demo1/shoeouter_bump.jpg',
                bumpScale: 0.03,
                color: 0x21553f,
                shiniess: 0x111111,
                specular: 0x444444
            },
            tiger: {
                texture: 'img/textures/demo1/tiger.jpg',
                bumpMap: 'img/textures/demo1/tiger_bump.jpg',
                bumpScale: 0.07,
                color: 0xffffff,
                shiniess: 0x444444,
                specular: 0x999999
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
                    materials: ['demo1ShoeOuter', 'demo1ShoeOuter2'],
                    file: 'border.json'
                },
                rivet: {
                    materials: ['demo1ShoeRivet'],
                    file: 'rivet.json'
                },
                shoein: {
                    materials: ['demo1ShoeInner'],
                    file: 'shoein.json'
                },
                shoeline: {
                    materials: ['demo1ShoeLine'],
                    file: 'shoeline.json'
                },
                shoeout: {
                    materials: ['demo1ShoeOuter', 'demo1ShoeOuter2', 'tiger'],
                    file: 'shoeout.json'
                },
                soles: {
                    materials: ['demo1Sole'],
                    file: 'soles.json'
                },
                ties: {
                    materials: ['demo1Tie', 'demo1Tie2'],
                    file: 'ties.json'
                }
            }
        }
    };

    function initNavButtons() {
        var navButtons = jQuery('#nav-buttons'),
            rotateAmount = 0.5,
            zoomAmount = 2;

        navButtons.on('click', '.rotate-left', function (event) {
            event.preventDefault();

            shoeApp.animate({
                duration: 500,
                step: function (percent, delta) {
                    shoeApp.shoe3D.rotateY(-rotateAmount * delta);
                }
            });
        });

        navButtons.on('click', '.rotate-right', function (event) {
            event.preventDefault();

            shoeApp.animate({
                duration: 500,
                step: function (percent, delta) {
                    shoeApp.shoe3D.rotateY(rotateAmount * delta);
                }
            });
        });

        navButtons.on('click', '.rotate-up', function (event) {
            event.preventDefault();

            shoeApp.animate({
                duration: 500,
                step: function (percent, delta) {
                    shoeApp.shoe3D.rotateX(-rotateAmount * delta);
                }
            });
        });

        navButtons.on('click', '.rotate-down', function (event) {
            event.preventDefault();

            shoeApp.animate({
                duration: 500,
                step: function (percent, delta) {
                    shoeApp.shoe3D.rotateX(rotateAmount * delta);
                }
            });
        });

        navButtons.on('click', '.zoom-in', function (event) {
            event.preventDefault();

            shoeApp.animate({
                duration: 500,
                step: function (percent, delta) {
                    shoeApp.shoe3D.zoom(-zoomAmount * delta);
                }
            });
        });

        navButtons.on('click', '.zoom-out', function (event) {
            event.preventDefault();

            shoeApp.animate({
                duration: 500,
                step: function (percent, delta) {
                    shoeApp.shoe3D.zoom(zoomAmount * delta);
                }
            });
        });
    };

    function startApplication() {
        var oldX = 0, oldY = 0,
            mousePressed = false;

        shoeApp.shoe3D.initialize(initConfig);

        shoeApp.shoe3D.loadModel('demo1', function (layers) {
            shoeApp.colorMenu.update(layers);
        });

        shoeApp.colorMenu.on('materialchange', function (event) {
            shoeApp.shoe3D.changeLayerMaterial(event.layerName, event.materialName);
        });

        shoeApp.colorMenu.on('layerchange', function (event) {
            shoeApp.shoe3D.flashLayer(event.layerName);
        });

        jQuery('#shoe-viewer').on('mousedown', function (event) {
            event.preventDefault();
            if (event.button === 2) {
                mousePressed = true;
            }
        });

        jQuery('#shoe-canvas').on('click', function (event) {
            var layerName, dimensions = {
                    width: jQuery('#shoe-canvas').width(),
                    height: jQuery('#shoe-canvas').height()
                };

            layerName = shoeApp.shoe3D.pickLayer({
                x: 2 * event.pageX / dimensions.width - 1,
                y: - 2 * event.pageY / dimensions.height + 1
            });

            if (layerName) {
                shoeApp.colorMenu.selectLayer(layerName);
            }
        });

        jQuery(window).on('contextmenu', function (event) {
            event.preventDefault();
        });

        jQuery(window).on('mouseup', function (event) {
            if (event.button === 2) {
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

        initNavButtons();
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