(function () {
    'use strict';
    var menu = jQuery('#color-menu'),
        selector = jQuery('#layer-selector'),
        colorPicker = jQuery('#color-picker');

    function update(layers) {
        var layer, sortedLayers;

        selector.html('');

        sortedLayers = layers.sort();

        for (layer = 0; layer < sortedLayers.length; layer += 1) {
            selector.append(jQuery('<option>').html(sortedLayers[layer]));
        }
    }

    function getSelectedLayer() {
        var selectedOption = selector.find('option:selected');

        return selectedOption.text();
    }

    colorPicker.on('click', '.color', function (event) {
        var colorNumber = parseInt(jQuery(this).data('color'), 16);
        event.preventDefault();

        menu.trigger({
           type: 'colorchange',
           color: colorNumber,
           layerName: getSelectedLayer()
        });
    });

    function initializeColors() {
        colorPicker.find('.color').each(function () {
            jQuery(this).css({
                backgroundColor: jQuery(this).data('color').replace('0x', '#')
            })
        });
    }

    initializeColors();

    shoeApp.colorMenu = {
        update: update,
        domElement: menu
    };
}());