'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};
var EXTENDED_PREFIX = '!';

function py2_round(value) {
    // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
    return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
}

function encode(current, previous, factor) {
    current = py2_round(current * factor);
    previous = py2_round(previous * factor);
    var coordinate = (current - previous) * 2;
    if (coordinate < 0) {
        coordinate = -coordinate - 1
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate /= 32;
    }
    output += String.fromCharCode((coordinate | 0) + 63);
    return output;
}

function factorForDimension(dimension, factor) {
    return dimension === 3 ? 1 : factor;
}

function decodeCoordinates(str, precision, dimensions) {
    var index = 0,
        coordinates = [],
        current = [],
        factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

    for (var i = 0; i < dimensions; i++) {
        current.push(0);
    }

    while (index < str.length) {
        var coordinate = [];

        for (var dimension = 0; dimension < dimensions; dimension++) {
            var byte = null,
                shift = 1,
                result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result += (byte & 0x1f) * shift;
                shift *= 32;
            } while (byte >= 0x20);

            var change = (result & 1) ? ((-result - 1) / 2) : (result / 2),
                dimensionFactor = factorForDimension(dimension, factor);

            current[dimension] += change;
            coordinate.push(current[dimension] / dimensionFactor);
        }

        coordinates.push(coordinate);
    }

    return coordinates;
}

function encodeCoordinates(coordinates, precision, dimensions) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, Number.isInteger(precision) ? precision : 5),
        output = '',
        previous = [];

    for (var dimension = 0; dimension < dimensions; dimension++) {
        previous.push(0);
    }

    for (var i = 0; i < coordinates.length; i++) {
        var coordinate = coordinates[i];

        for (dimension = 0; dimension < dimensions; dimension++) {
            var dimensionFactor = factorForDimension(dimension, factor);
            output += encode(coordinate[dimension], previous[dimension], dimensionFactor);
            previous[dimension] = coordinate[dimension];
        }
    }

    return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
polyline.decode = function(str, precision) {
    return decodeCoordinates(str, precision, 2);
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    return encodeCoordinates(coordinates, precision, 2);
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i].slice();
        var x = coord[0];
        coord[0] = coord[1];
        coord[1] = x;
        flipped.push(coord);
    }
    return flipped;
}

function getDimensions(coords) {
    var dimensions = coords.length ? coords[0].length : 2;

    if (dimensions < 2 || dimensions > 4) {
        throw new Error('GeoJSON positions must have between 2 and 4 elements');
    }

    for (var i = 1; i < coords.length; i++) {
        if (coords[i].length !== dimensions) {
            throw new Error('GeoJSON positions must have consistent dimensions');
        }
    }

    return dimensions;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }

    var coords = flipped(geojson.coordinates),
        dimensions = getDimensions(coords);

    if (dimensions === 2) {
        return polyline.encode(coords, precision);
    }

    return EXTENDED_PREFIX + dimensions + encodeCoordinates(coords, precision, dimensions);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords;

    if (str.charAt(0) === EXTENDED_PREFIX) {
        var dimensions = parseInt(str.charAt(1), 10);

        if (dimensions !== 3 && dimensions !== 4) {
            throw new Error('Invalid extended polyline dimensions');
        }

        coords = decodeCoordinates(str.substring(2), precision, dimensions);
    } else {
        coords = polyline.decode(str, precision);
    }

    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}
