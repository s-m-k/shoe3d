/*global document, window, THREE, shoeApp*/

(function () {
    'use strict';

    function loadTexture(url, callback) {
        var textureLoader = new THREE.TextureLoader();

        textureLoader.addEventListener('load', function (event) {
            event.content.wrapS = THREE.Repeat;
            event.content.wrapT = THREE.Repeat;
            callback(event.content);
        }, false);
        textureLoader.load(url);

        return textureLoader;
    }

    function createMaterial(matDef, callback) {
        var matParams,
            loadingMonitor;

        if (matDef.cachedMaterial) {
            callback(matDef.cachedMaterial);
            return;
        }

        matParams = {
            color: matDef.color === undefined ? 0xffffff : matDef.color,
            shiniess: matDef.shiniess === undefined ? 0xffffff : matDef.shiniess,
            specular: matDef.specular === undefined ? 0xffffff : matDef.specular
        };

        loadingMonitor = new THREE.LoadingMonitor();

        if (matDef.texture) {
            loadingMonitor.add(loadTexture(matDef.texture, function (texture) {
                matParams.map = texture;
            }));
        }

        if (matDef.normalMap) {
            loadingMonitor.add(loadTexture(matDef.normalMap, function (texture) {
                matParams.normalMap = texture;
                matParams.normalScale = matDef.normalScale;
            }));
        }

        if (matDef.bumpMap) {
            loadingMonitor.add(loadTexture(matDef.bumpMap, function (texture) {
                matParams.bumpMap = texture;
                matParams.bumpScale = matDef.bumpScale;
            }));
        }

        if (matDef.texture || matDef.normalmap) {
            loadingMonitor.addEventListener('load', function () {
                matDef.cachedMaterial = new THREE.MeshPhongMaterial(matParams);
                callback(matDef.cachedMaterial);
            }, false);
        } else {
            matDef.cachedMaterial = new THREE.MeshPhongMaterial(matParams);
            callback(matDef.cachedMaterial);
        }
    }

    shoeApp.materialGenerator = {
        createMaterial: createMaterial
    };
}());