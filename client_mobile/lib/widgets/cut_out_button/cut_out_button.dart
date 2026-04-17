import 'dart:async';
import 'dart:collection';
import 'dart:ui' as ui;

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'cut_out_button_const.dart';

const int _IMAGE_CACHE_MAX_ENTRIES = 32;

class _LruImageCache {
  final LinkedHashMap<String, ui.Image> _entries = LinkedHashMap<String, ui.Image>();

  ui.Image? operator [](String key) {
    final image = _entries.remove(key);
    if (image != null) {
      _entries[key] = image;
    }
    return image;
  }

  void operator []=(String key, ui.Image image) {
    _entries.remove(key);
    _entries[key] = image;
    while (_entries.length > _IMAGE_CACHE_MAX_ENTRIES) {
      _entries.remove(_entries.keys.first);
    }
  }

  bool containsKey(String key) => _entries.containsKey(key);
}

final _LruImageCache _imageCache = _LruImageCache();

int colorToRedChannel(Color color) => (color.r * 255.0).round().clamp(0, 255);
int colorToGreenChannel(Color color) => (color.g * 255.0).round().clamp(0, 255);
int colorToBlueChannel(Color color) => (color.b * 255.0).round().clamp(0, 255);

bool pixelMatchesColor(int red, int green, int blue, Color targetColor) {
  return (red - colorToRedChannel(targetColor)).abs() <= COLOR_TOLERANCE &&
      (green - colorToGreenChannel(targetColor)).abs() <= COLOR_TOLERANCE &&
      (blue - colorToBlueChannel(targetColor)).abs() <= COLOR_TOLERANCE;
}

Future<ui.Image> remapImageColors(String assetPath, Color remappedBlackColor, Color remappedWhiteColor, Color remappedOtherColor) async {
  final String cacheKey = '${assetPath}_${remappedBlackColor.toARGB32()}_${remappedWhiteColor.toARGB32()}_${remappedOtherColor.toARGB32()}';

  if (_imageCache.containsKey(cacheKey)) {
    return _imageCache[cacheKey]!;
  }

  final ByteData imageData = await rootBundle.load(assetPath);
  final ui.Codec imageCodec = await ui.instantiateImageCodec(imageData.buffer.asUint8List());
  final ui.FrameInfo frameInfo = await imageCodec.getNextFrame();
  final ui.Image originalImage = frameInfo.image;

  final ByteData? pixelData = await originalImage.toByteData(format: ui.ImageByteFormat.rawRgba);
  if (pixelData == null) {
    throw Exception('Failed to get pixel data');
  }

  final Uint8List remappedBytes = Uint8List.fromList(pixelData.buffer.asUint8List());

  for (int byteIndex = 0; byteIndex < remappedBytes.length; byteIndex += 4) {
    final int red = remappedBytes[byteIndex];
    final int green = remappedBytes[byteIndex + 1];
    final int blue = remappedBytes[byteIndex + 2];

    if (pixelMatchesColor(red, green, blue, SOURCE_BLACK)) {
      remappedBytes[byteIndex] = colorToRedChannel(remappedBlackColor);
      remappedBytes[byteIndex + 1] = colorToGreenChannel(remappedBlackColor);
      remappedBytes[byteIndex + 2] = colorToBlueChannel(remappedBlackColor);
    } else if (pixelMatchesColor(red, green, blue, SOURCE_WHITE)) {
      remappedBytes[byteIndex] = colorToRedChannel(remappedWhiteColor);
      remappedBytes[byteIndex + 1] = colorToGreenChannel(remappedWhiteColor);
      remappedBytes[byteIndex + 2] = colorToBlueChannel(remappedWhiteColor);
    } else {
      remappedBytes[byteIndex] = colorToRedChannel(remappedOtherColor);
      remappedBytes[byteIndex + 1] = colorToGreenChannel(remappedOtherColor);
      remappedBytes[byteIndex + 2] = colorToBlueChannel(remappedOtherColor);
    }
  }

  final Completer<ui.Image> imageCompleter = Completer<ui.Image>();
  ui.decodeImageFromPixels(remappedBytes, originalImage.width, originalImage.height, ui.PixelFormat.rgba8888, imageCompleter.complete);

  final ui.Image remappedImage = await imageCompleter.future;
  _imageCache[cacheKey] = remappedImage;
  return remappedImage;
}

class CutOutButton extends StatefulWidget {
  const CutOutButton({
    super.key,
    this.onAction,
    this.child,
    this.opacity,
    this.lightColor = SOURCE_BLACK,
    this.darkColor = SOURCE_WHITE,
    this.mainColor = SOURCE_BLACK,
  });

  final double? opacity;
  final VoidCallback? onAction;
  final Widget? child;
  final Color lightColor;
  final Color darkColor;
  final Color mainColor;

  @override
  State<CutOutButton> createState() => _CutOutButtonState();
}

class _CutOutButtonState extends State<CutOutButton> {
  bool isPressed = false;

  ui.Image? leftEdgeImage;
  ui.Image? centerBodyImage;
  ui.Image? rightEdgeImage;

  ui.Image? leftEdgePressedImage;
  ui.Image? centerBodyPressedImage;
  ui.Image? rightEdgePressedImage;

  bool get isInteractive => widget.onAction != null;

  @override
  void initState() {
    super.initState();
    loadButtonImages();
  }

  @override
  void didUpdateWidget(CutOutButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.lightColor != widget.lightColor || oldWidget.darkColor != widget.darkColor || oldWidget.mainColor != widget.mainColor) {
      loadButtonImages();
    }
  }

  Future<void> loadButtonImages() async {
    final List<ui.Image> loadedImages = await Future.wait([
      remapImageColors(CUT_OUT_BUTTON_LEFT_EDGE_PATH, widget.lightColor, widget.mainColor, widget.darkColor),
      remapImageColors(CUT_OUT_BUTTON_BODY_PATH, widget.lightColor, widget.mainColor, widget.darkColor),
      remapImageColors(CUT_OUT_BUTTON_RIGHT_EDGE_PATH, widget.lightColor, widget.mainColor, widget.darkColor),
      remapImageColors(CUT_OUT_BUTTON_LEFT_EDGE_PATH, widget.darkColor, widget.mainColor, widget.lightColor),
      remapImageColors(CUT_OUT_BUTTON_BODY_PATH, widget.darkColor, widget.mainColor, widget.lightColor),
      remapImageColors(CUT_OUT_BUTTON_RIGHT_EDGE_PATH, widget.darkColor, widget.mainColor, widget.lightColor),
    ]);

    if (!mounted) {
      return;
    }

    setState(() {
      leftEdgeImage = loadedImages[0];
      centerBodyImage = loadedImages[1];
      rightEdgeImage = loadedImages[2];
      leftEdgePressedImage = loadedImages[3];
      centerBodyPressedImage = loadedImages[4];
      rightEdgePressedImage = loadedImages[5];
    });
  }

  void setPressedState(bool pressed) {
    if (!isInteractive) {
      return;
    }

    setState(() {
      isPressed = pressed;
      AudioService().playSoundEffect(SoundEffect.Select.path);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (leftEdgeImage == null || centerBodyImage == null || rightEdgeImage == null) {
      return const SizedBox.expand();
    }

    final ui.Image? displayedLeftEdgeImage = isPressed ? leftEdgePressedImage : leftEdgeImage;
    final ui.Image? displayedCenterBodyImage = isPressed ? centerBodyPressedImage : centerBodyImage;
    final ui.Image? displayedRightEdgeImage = isPressed ? rightEdgePressedImage : rightEdgeImage;

    final Widget buttonContent = Stack(
      fit: StackFit.expand,
      children: [
        Row(
          children: [
            RawImage(
              image: displayedLeftEdgeImage,
              fit: BoxFit.fitHeight,
              height: double.infinity,
              alignment: Alignment.centerLeft,
              filterQuality: FilterQuality.none,
            ),
            Expanded(
              child: RawImage(image: displayedCenterBodyImage, fit: BoxFit.fill, height: double.infinity, filterQuality: FilterQuality.none),
            ),
            RawImage(
              image: displayedRightEdgeImage,
              fit: BoxFit.fitHeight,
              height: double.infinity,
              alignment: Alignment.centerRight,
              filterQuality: FilterQuality.none,
            ),
          ],
        ),
        if (widget.child != null) Center(child: widget.child!),
      ],
    );

    final double brightness = isPressed ? PRESSED_BRIGHTNESS : DEFAULT_BRIGHTNESS;
    final double opacity = widget.opacity ?? DEFAULT_OPACITY;

    final Widget animatedButtonContent = AnimatedScale(
      scale: isPressed ? PRESSED_SCALE : 1,
      duration: const Duration(milliseconds: PRESS_ANIMATION_DURATION_MILLISECONDS),
      child: ColorFiltered(
        colorFilter: ColorFilter.matrix(<double>[brightness, 0, 0, 0, 0, 0, brightness, 0, 0, 0, 0, 0, brightness, 0, 0, 0, 0, 0, opacity, 0]),
        child: buttonContent,
      ),
    );

    if (!isInteractive) {
      return SizedBox.expand(child: animatedButtonContent);
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: widget.onAction,
      onTapDown: (_) => setPressedState(true),
      onTapUp: (_) => setPressedState(false),
      onTapCancel: () => setPressedState(false),
      child: SizedBox.expand(child: animatedButtonContent),
    );
  }
}
