[![Build Status](https://app.travis-ci.com/mapbox/polyline.svg?branch=master)](https://app.travis-ci.com/mapbox/polyline) [![codecov](https://codecov.io/gh/mapbox/polyline/branch/master/graph/badge.svg)](https://codecov.io/gh/mapbox/polyline)

polyline
---

A simple [google-esque polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
implementation in Javascript. Compatible with nodejs (`npm install @mapbox/polyline` and the browser (copy `src/polyline.js`)).

Encodes from / decodes into `[lat, lng]` coordinate pairs. Use `fromGeoJSON()` to encode from GeoJSON objects, or `toGeoJSON` to
decode to a GeoJSON LineString.

GeoJSON LineStrings may use `[longitude, latitude]`, `[longitude, latitude, altitude]`, or
`[longitude, latitude, altitude, timestamp]` positions. Altitude and timestamp streams use
an extended polyline format prefixed with `!3` or `!4`. Longitude, latitude, and altitude
are rounded using the configured precision. Timestamps are rounded to integer units; the
first timestamp is stored in full and the following timestamps are stored as deltas.

The fourth timestamp element is a historical GeoJSON extension. [RFC 7946](https://www.rfc-editor.org/rfc/rfc7946.html#section-3.1.1)
recommends limiting positions to three elements because parsers may ignore additional
elements.

## Installation

    npm install @mapbox/polyline
    
Note that the old package `polyline` has been deprecated in favor of `@mapbox/polyline` (the old package remain but won't receive updates).

## Example

```js
var polyline = require('@mapbox/polyline');

// returns an array of lat, lon pairs
polyline.decode('_p~iF~ps|U_ulLnnqC_mqNvxq`@');

// returns an array of lat, lon pairs from polyline6 by passing a precision parameter
polyline.decode('cxl_cBqwvnS|Dy@ogFyxmAf`IsnA|CjFzCsHluD_k@hi@ljL', 6);

// returns a GeoJSON LineString Geometry
polyline.toGeoJSON('_p~iF~ps|U_ulLnnqC_mqNvxq`@');

// returns a string-encoded polyline (from coordinate ordered lat,lng)
polyline.encode([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);

// returns a string-encoded polyline from a GeoJSON LineString
polyline.fromGeoJSON({ "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252]]
  },
  "properties": {}
});

```

[API Documentation](https://github.com/mapbox/polyline/blob/master/API.md)

## Command line

Install globally or run `./node_modules/.bin/polyline`.

Send input via stdin and use `--decode`, `--encode`, `--toGeoJSON`, or `--fromGeoJSON` flags. If omitted will default to `--decode`.

Example :

```
cat file.json | ./bin/polyline.bin.js --fromGeoJSON > result.txt
```
