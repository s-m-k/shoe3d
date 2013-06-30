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
        highlight,
        renderTimeout = null,
        cameraRotationY = 90,
        cameraRotationX = 0,
        cameraDist = 8,
        viewedObject = null,
        flashMaterial,
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
        clearTimeout(renderTimeout);

        renderTimeout = setTimeout(function () {
            postprocessing.render();
            renderTimeout = null;
        }, 0);
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

        ambient = new THREE.AmbientLight(0x444444);
        light = new THREE.DirectionalLight(0xffffff, 1);

        scene.fog = new THREE.FogExp2(0xffffff, 0.025);

        light.position.set(0, 1, 2);

        scene.add(ambient);
        scene.add(light);

        renderer.setClearColorHex(0xffffff, 1);

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
            layerProps = [], totalToLoad = 0, layersLoading = 0;

        viewedObject = new THREE.Object3D();
        viewedObject.position.set(0, 0, 0);
        viewedObject.rotationAutoUpdate = true;
        viewedObject.shoeMaterials = {};
        viewedObject.shoeLayers = {};

        document.querySelector('#shoe-wrapper').setAttribute('class', 'loading');

        function loaderHandler(layerName, layer) {
            return function (geometry) {
                shoeApp.materialGenerator.createMaterial(materials[layer.materials[0]], function (material) {
                    var mesh = new THREE.Mesh(geometry, material);

                    mesh.shoeLayerName = layerName;

                    viewedObject.add(mesh);
                    viewedObject.shoeMaterials[layerName] = material;
                    viewedObject.shoeLayers[layerName] = mesh;

                    layerProps.push({
                        name: layerName,
                        materials: layer.materials
                    });

                    layersLoading -= 1;

                    updateProgress(1 - layersLoading / totalToLoad);

                    if (layersLoading === 0 && callback) {
                        document.querySelector('#shoe-wrapper').setAttribute('class', '');
                        render();
                        callback(layerProps);
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

    function pickLayer(mouseCoord) {
        var projector = new THREE.Projector(),
            ray, layerName, model, meshes, objects;

        ray = projector.pickingRay(new THREE.Vector3(mouseCoord.x, mouseCoord.y, 0), camera);

        model = viewedObject.shoeLayers;
        meshes = [];

        for (layerName in model) {
            if (model.hasOwnProperty(layerName)) {
                meshes.push(model[layerName]);
            }
        }

        objects = ray.intersectObjects(meshes, true);

        return objects.length > 0 ? objects[0].object.shoeLayerName : null;
    }

    function createHighlight(layerMesh, callback) {
        shoeApp.materialGenerator.createMaterial(flashMaterial, function (material) {
            var clonedMesh = layerMesh.clone();

            material.transparent = true;

            clonedMesh.material = material;
            scene.add(clonedMesh);

            callback(clonedMesh);
        });
    }

    function flashLayer(layerName) {
        var layerMesh = viewedObject.shoeLayers[layerName];

        if (layerMesh) {
            createHighlight(layerMesh, function (clonedMesh) {
                shoeApp.animate({
                    duration: 500,
                    step: function (progress) {
                        clonedMesh.material.opacity = 1 - progress;
                        render();
                    },
                    complete: function () {
                        scene.remove(clonedMesh);
                    }
                });
            });
        }
    }

    function highlightLayer(layerName) {
        var layerMesh = viewedObject.shoeLayers[layerName];

        if (layerMesh) {
            if (!highlight || highlight.layerName !== layerName) {
                if (highlight) {
                    scene.remove(highlight.mesh);
                }

                highlight = {
                    layerName: layerName
                };

                createHighlight(layerMesh, function (clonedMesh) {
                    clonedMesh.material.opacity = 0.25;
                    highlight.mesh = clonedMesh;
                });

                render();
            }
        } else if (highlight) {
            scene.remove(highlight.mesh);
            highlight = null;

            render();
        }
    }

    function initialize(configuration) {
        models = configuration.models;
        materials = configuration.materials;
        flashMaterial = configuration.flashMaterial;

        flashMaterial.noCache = true;

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

    function changeLayerMaterial(layerName, materialName) {
        shoeApp.materialGenerator.createMaterial(materials[materialName], function (material) {
            viewedObject.shoeLayers[layerName].material = material;
            render();
        });
    }

    shoeApp.shoe3D = {
        initialize: initialize,
        rotateX: rotateX,
        rotateY: rotateY,
        zoom: zoom,
        pickLayer: pickLayer,
        flashLayer: flashLayer,
        highlightLayer: highlightLayer,
        changeLayerMaterial: changeLayerMaterial,
        loadModel: loadModel
    };
}());