### polyline.decode(string[, precision])

Takes a string representation of 1+ coordinate pairs
and returns an array of lat, lon arrays. If not specified,
precision defaults to 5.

### polyline.encode(array[, precision])

Takes an array of lat, lon arrays and returns an encoded
string. If not specified, precision defaults to 5.

### polyline.fromGeoJSON(geojson[, precision])

Takes a GeoJSON LineString feature and returns an encoded string. If not specified, precision defaults to 5.
Positions may contain longitude, latitude, optional altitude, and an optional integer timestamp after altitude.
Altitude and timestamp streams use an extended polyline format prefixed with `!3` or `!4`. The first timestamp
is stored in full and subsequent timestamps are stored as deltas. A fourth position element is a historical
GeoJSON extension that parsers may ignore; RFC 7946 recommends limiting positions to three elements.

### polyline.toGeoJSON(string[, precision])

Takes an encoded string and returns a GeoJSON LineString geometry. If not specified, precision defaults to 5.
Extended `!3` and `!4` streams decode to positions with altitude and optional timestamp elements.
