(function () {
    'use strict';
    var props = jQuery({}),
        selector = jQuery('#layer-selector'),
        colorPicker = jQuery('#color-picker'),
        materials = {};

    function generateMaterialPalette(materials) {
        var i, colorTile, thumbnail;

        colorPicker.html('');

        if (materials) {
            for (i = 0; i < materials.length; i += 1) {
                colorTile = jQuery('<li />', {
                    'class': 'color',
                    'data-material': materials[i]
                });

                thumbnail = 'img/thumbnails/' + materials[i] + '.jpg';
                colorTile.css('background', 'url(' + thumbnail + ')');

                colorPicker.append(colorTile);
            }
        }
    }

    props.update = function (layers) {
        var layer, sortedLayers,
            option;

        selector.html('');
        materials = {};

        sortedLayers = layers.sort(function (a, b) {
            return a.name > b.name ? 1 : -1;
        });

        for (layer = 0; layer < sortedLayers.length; layer += 1) {
            option = jQuery('<option>', {
                'value': sortedLayers[layer].name
            }).html(sortedLayers[layer].name);

            materials[sortedLayers[layer].name] = sortedLayers[layer].materials;

            selector.append(option);
        }

        generateMaterialPalette(materials[selector.val()]);
    }

    props.selectLayer = function (name) {
        selector.val(name).change();
    }

    function getSelectedLayer() {
        var selectedOption = selector.find('option:selected');

        return selectedOption.text();
    }

    colorPicker.on('click', '.color', function (event) {
        var materialName = jQuery(this).data('material');
        event.preventDefault();

        props.trigger({
           type: 'materialchange',
           materialName: materialName,
           layerName: getSelectedLayer()
        });
    });

    selector.on('change', function (event) {

        generateMaterialPalette(materials[selector.val()]);

        props.trigger({
            type: 'layerchange',
            layerName: getSelectedLayer()
        });
    });

    shoeApp.colorMenu = props;
}());