/*global document, window, jQuery, shoeApp, Date*/

(function () {
    'use strict';

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }());

    shoeApp.animate = function (config) {
        var duration = config.duration || 1000,
            easing = config.easing || jQuery.easing.swing,
            step = config.step || function () { },
            complete = config.complete || function () { },
            oldDate, oldPercent;

        function frame() {
            var percent, timeDifference, delta;

            timeDifference = Date.now() - oldDate;

            if (timeDifference < duration) {
                window.requestAnimFrame(frame);
            } else {
                complete();
            }

            percent = easing(Math.min(1, timeDifference / duration));
            delta = percent - oldPercent;
            oldPercent = percent;

            step(percent, delta);
        }

        oldDate = Date.now();
        oldPercent = 0;
        
        frame();
    };
}());