# Changelog

## 0.1.0

This project is a fork of [`mapbox/polyline`](https://github.com/mapbox/polyline).

Changes from the upstream project:

* Rename the package to `@oidoug/polyline-timestamp`.
* Preserve compatibility with standard two-dimensional Google polyline strings
  and the original `encode()` and `decode()` APIs.
* Add GeoJSON LineString support for `[longitude, latitude, altitude]`
  positions.
* Add GeoJSON LineString support for `[longitude, latitude, altitude,
  timestamp]` positions.
* Add self-describing `!3` and `!4` prefixes for extended polyline strings so
  altitude and timestamp streams decode unambiguously.
* Encode the first timestamp in full and subsequent timestamps as deltas.
* Accept and return GeoJSON timestamps as Unix epoch milliseconds while
  rounding encoded timestamps to whole seconds to reduce string size.
* Allow multiple GPS fixes within the same second to decode to the same
  timestamp.
* Validate that GeoJSON positions use a consistent supported dimension count.
* Add round-trip tests for altitude, timestamps, coordinate rounding,
  timestamp compression, same-second collisions, and invalid extended input.
* Update the documentation with installation instructions, examples, the
  extended format contract, and the RFC 7946 interoperability caveat for
  fourth position elements.
