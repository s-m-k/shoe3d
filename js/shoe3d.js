/*global document, window, THREE, shoeApp*/

(function () {
    'use strict';

    var config,
        loadingMonitor,
        modelLoader,
        textureLoader,
        renderer,
        postprocessing,
        scene,
        camera,
        light,
        cameraRotationY = 90,
        cameraRotationX = 0,
        cameraDist = 8,
        viewedObject = null,
        models = {},
        materials = {};

    config = {
        width: 1280,
        height: 720,
        modelURL: 'obj/'
    };

    function initializeLoaders() {
        loadingMonitor = new THREE.LoadingMonitor();
        textureLoader = new THREE.TextureLoader();
        modelLoader = new THREE.JSONLoader();
    }

    function initializeRenderer() {
        renderer = new THREE.WebGLRenderer({
            canvas: jQuery('#shoe-canvas')[0]
        });
        renderer.setSize(config.width, config.height);
    }

    function render() {
        postprocessing.render();
    }

    function updateCamera() {
        var rotation;

        if (cameraRotationX > Math.PI / 2) {
            cameraRotationX = Math.PI / 2;
        }

        if (cameraRotationX < -Math.PI / 2) {
            cameraRotationX = -Math.PI / 2;
        }

        if (cameraDist < 6) {
            cameraDist = 6;
        }

        if (cameraDist > 10) {
            cameraDist = 10;
        }

        rotation = {
            x: cameraDist * Math.cos(cameraRotationY) * Math.cos(cameraRotationX),
            y: cameraDist * Math.sin(cameraRotationX),
            z: cameraDist * Math.sin(cameraRotationY) * Math.cos(cameraRotationX)
        };

        camera.position.set(rotation.x, rotation.y, rotation.z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        if (light) {
            light.position.set(rotation.x, rotation.y, rotation.z);
        }
    }

    function initializePostprocessing() {
        postprocessing = new shoeApp.Postprocessing(scene, renderer, camera);

        postprocessing.setPasses([
            {
                name: 'antialiasing',
                shader: shoeApp.FXAAShader,
                uniforms: {
                    resolution: {
                        type: 'v2',
                        value: new THREE.Vector2(1 / config.width, 1 / config.height)
                    }
                }
            }
        ]);
    }

    function initializeScene() {
        var ambient;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, config.width / config.height, 0.1, 1000);

        ambient = new THREE.AmbientLight(0x000000);
        light = new THREE.DirectionalLight(0xffffff, 1);

        light.position.set(0, 1, 2);

        scene.add(ambient);
        scene.add(light);

        updateCamera();
        initializePostprocessing();
    }

    function unloadModel() {
        if (viewedObject) {
            scene.remove(viewedObject);
        }
    }

    function updateProgress(percent) {
        document.querySelector('#progress-bar').style.width = Math.floor(percent * 100) + '%';
    }

    function loadModel(modelName, callback) {
        var model = models[modelName], layerName, layer,
            layerNames = [], totalToLoad = 0, layersLoading = 0;

        viewedObject = new THREE.Object3D();
        viewedObject.position.set(0, 0, 0);
        viewedObject.rotationAutoUpdate = true;
        viewedObject.shoeLayers = {};

        document.querySelector('#shoe-wrapper').setAttribute('class', 'loading');

        function loaderHandler(layerName, layer) {
            return function (geometry) {
                shoeApp.materialGenerator.createMaterial(materials[layer.material], function (material) {
                    var mesh = new THREE.Mesh(geometry, material);
                    viewedObject.add(mesh);
                    viewedObject.shoeLayers[layerName] = material;
                    layerNames.push(layerName);

                    layersLoading -= 1;

                    updateProgress(1 - layersLoading / totalToLoad);

                    if (layersLoading === 0 && callback) {
                        document.querySelector('#shoe-wrapper').setAttribute('class', '');
                        render();
                        callback(layerNames);
                    }
                });
            };
        }

        for (layerName in model) {
            if (model.hasOwnProperty(layerName)) {
                layersLoading += 1;
                totalToLoad = layersLoading;

                layer = model[layerName];

                modelLoader.load(
                    config.modelURL + '/' + modelName + '/' + layer.file,
                    loaderHandler(layerName, layer)
                );
            }
        }

        scene.add(viewedObject);
    }

    function initialize(configuration) {
        models = configuration.models;
        materials = configuration.materials;

        initializeLoaders();
        initializeRenderer();
        initializeScene();
    }

    function rotateX(amount) {
        cameraRotationX += amount;
        updateCamera();

        render();
    }

    function rotateY(amount) {
        cameraRotationY += amount;
        updateCamera();

        render();
    }

    function zoom(amount) {
        cameraDist += amount;
        updateCamera();

        render();
    }

    function changeLayerColor(layerName, color) {
        viewedObject.shoeLayers[layerName].color = new THREE.Color(color);
        render();
    }

    shoeApp.shoe3D = {
        initialize: initialize,
        rotateX: rotateX,
        rotateY: rotateY,
        zoom: zoom,
        changeLayerColor: changeLayerColor,
        loadModel: loadModel
    };
}());