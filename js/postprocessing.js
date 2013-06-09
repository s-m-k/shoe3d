/*global document, window, THREE, shoeApp*/

(function () {
    'use strict';

    shoeApp.Postprocessing = function (scene, renderer, camera) {
        this.passes = {};
        this.composer = new THREE.EffectComposer(renderer);
        this.composer.addPass(new THREE.RenderPass(scene, camera));

        this.camera = camera;
        this.canRenderDepthMap = true;

        this.updateOperations = {};
    };

    shoeApp.Postprocessing.prototype.setPasses = function (passes) {
        var passName, passShader, currentPassData, shaderPass,
            i, uniform;

        for (i = 0; i < passes.length; i += 1) {
            currentPassData = passes[i];
            passName = currentPassData.name;
            passShader = currentPassData.shader;

            shaderPass = new THREE.ShaderPass(passShader);
            shaderPass.uniforms = shaderPass.uniforms || {};

            for (uniform in currentPassData.uniforms) {
                shaderPass.uniforms[uniform] = currentPassData.uniforms[uniform];
            }

            shaderPass.uniforms.depthMap = shaderPass.uniforms.depthMap || { type: 't'};
            shaderPass.uniforms.depthMap.value = this.depthMap;

            if (i === passes.length - 1) {
                shaderPass.renderToScreen = true;
            }

            if (currentPassData.updateOperation) {
                this.updateOperations[passName] = currentPassData.updateOperation;
            }

            this.composer.addPass(shaderPass);
            this.passes[passName] = shaderPass;
        }
    };

    shoeApp.Postprocessing.prototype.executeOperations = function () {
        var operation, passName;

        for (passName in this.updateOperations) {
            operation = this.updateOperations[passName];
            operation.apply(this.passes[passName]);
        }
    };

    shoeApp.Postprocessing.prototype.render = function () {
        this.executeOperations();
        this.composer.render();
    };
}());