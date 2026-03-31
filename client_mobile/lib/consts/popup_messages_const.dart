import 'dart:ui';

const List<String> KEYWORDS_TO_REPLACE = <String>['debug'];

const int POPUP_DELAY_IN_SECONDS = 3;

const POPUP_COLOR_FILTER = ColorFilter.matrix(<double>[
  -0.525,
  1.543,
  -0.018,
  0,
  0,
  0.398,
  0.410,
  0.192,
  0,
  0,
  0.559,
  1.295,
  -0.854,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
]);

const DARK_DESATURATION_FILTER = ColorFilter.matrix(<double>[
  0.9213,
  0.0715,
  0.0072,
  0,
  0,
  0.0213,
  0.9715,
  0.0072,
  0,
  0,
  0.0213,
  0.0715,
  0.9072,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
]);

const DARK_CONTRAST_FILTER = ColorFilter.matrix(<double>[1.2, 0, 0, 0, -25.5, 0, 1.2, 0, 0, -25.5, 0, 0, 1.2, 0, -25.5, 0, 0, 0, 1, 0]);

const DARK_BRIGHTNESS_FILTER = ColorFilter.matrix(<double>[0.85, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 1, 0]);
