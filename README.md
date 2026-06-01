# polyline-timestamp

A timestamp-aware fork of [`@mapbox/polyline`](https://github.com/mapbox/polyline).
It implements Google-style polyline encoding and adds compact altitude and timestamp
support for GeoJSON LineStrings.

The original `encode()` and `decode()` methods remain compatible with standard
`[latitude, longitude]` polyline strings. Use `fromGeoJSON()` and `toGeoJSON()` for
GeoJSON coordinates ordered as `[longitude, latitude]`.

## Installation

```sh
npm install @oidoug/polyline-timestamp
```

## GeoJSON Coordinates

`fromGeoJSON()` accepts LineString geometries and LineString features with these
position formats:

| Position       | Contents                                 | Encoded format                       |
| -------------- | ---------------------------------------- | ------------------------------------ |
| `[X, Y]`       | Longitude, latitude                      | Standard polyline                    |
| `[X, Y, Z]`    | Longitude, latitude, altitude            | Extended polyline prefixed with `!3` |
| `[X, Y, Z, T]` | Longitude, latitude, altitude, timestamp | Extended polyline prefixed with `!4` |

Longitude, latitude, and altitude are rounded using the configured precision,
which defaults to `5`.

`T` is a Unix epoch timestamp in milliseconds when passed to or returned from the
GeoJSON methods. To reduce the encoded size, timestamps are rounded to whole
seconds on the wire. The first timestamp is stored in full; subsequent timestamps
are stored as deltas. Multiple GPS fixes within the same second intentionally
decode to the same timestamp.

The fourth timestamp element is a historical GeoJSON extension. [RFC 7946
section 3.1.1](https://www.rfc-editor.org/rfc/rfc7946.html#section-3.1.1)
recommends limiting positions to three elements because some GeoJSON parsers may
ignore additional elements.

## Usage

```js
var polyline = require("@oidoug/polyline-timestamp");

// Standard polyline encoding remains unchanged.
var encoded = polyline.encode([
  [38.5, -120.2],
  [40.7, -120.95],
  [43.252, -126.453],
]);

// "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
console.log(encoded);

// Returns arrays ordered as [latitude, longitude].
console.log(polyline.decode(encoded));

var track = {
  type: "LineString",
  coordinates: [
    [-120.200004, 38.500004, 12.345678, 1710000000000],
    [-120.950006, 40.700006, 13.456789, 1710000001234],
    [-126.453004, 43.252004, 14.567891, 1710000004321],
  ],
};

var encodedTrack = polyline.fromGeoJSON(track);

// Extended XYZT strings start with "!4".
console.log(encodedTrack.startsWith("!4"));

// Returns a GeoJSON LineString geometry. Coordinates and altitude are rounded
// to five decimal places; timestamps are rounded to whole seconds.
console.log(polyline.toGeoJSON(encodedTrack));
```

The decoded track is:

```json
{
  "type": "LineString",
  "coordinates": [
    [-120.2, 38.5, 12.34568, 1710000000000],
    [-120.95001, 40.70001, 13.45679, 1710000001000],
    [-126.453, 43.252, 14.56789, 1710000004000]
  ]
}
```

See [API.md](./API.md) for method details.

## Command Line

Install globally or run `./node_modules/.bin/polyline`.

Send input through stdin and use `--decode`, `--encode`, `--toGeoJSON`, or
`--fromGeoJSON`. If no operation is provided, the CLI defaults to `--decode`.

```sh
cat file.json | ./node_modules/.bin/polyline --fromGeoJSON
```
