import 'package:flutter/material.dart';

import 'settings_popup_const.dart';

class VolumeSlider extends StatelessWidget {
  const VolumeSlider({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.labelStyle,
    required this.sliderWidth,
    required this.sliderHeight,
  });

  final String label;
  final double value;
  final ValueChanged<double> onChanged;
  final TextStyle labelStyle;
  final double sliderWidth;
  final double sliderHeight;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: labelStyle),
        SizedBox(height: sliderHeight * 0.3),
        CubicSlider(value: value, onChanged: onChanged, width: sliderWidth, height: sliderHeight),
      ],
    );
  }
}

class CubicSlider extends StatefulWidget {
  const CubicSlider({super.key, required this.value, required this.onChanged, required this.width, required this.height});

  final double value;
  final ValueChanged<double> onChanged;
  final double width;
  final double height;

  @override
  State<CubicSlider> createState() => _CubicSliderState();
}

class _CubicSliderState extends State<CubicSlider> {
  bool _isDragging = false;

  void _updateValue(double localX) {
    final thumbSize = widget.height;
    final effectiveWidth = widget.width - thumbSize;
    final clampedX = (localX - thumbSize / 2).clamp(0.0, effectiveWidth);
    final newValue = (clampedX / effectiveWidth).clamp(0.0, 1.0);
    widget.onChanged(newValue);
  }

  @override
  Widget build(BuildContext context) {
    final thumbSize = widget.height;
    final trackHeight = widget.height * 0.5;
    final effectiveWidth = widget.width - thumbSize;
    final thumbPosition = widget.value * effectiveWidth;

    return GestureDetector(
      onPanStart: (details) {
        setState(() => _isDragging = true);
        _updateValue(details.localPosition.dx);
      },
      onPanUpdate: (details) {
        _updateValue(details.localPosition.dx);
      },
      onPanEnd: (_) {
        setState(() => _isDragging = false);
      },
      onTapDown: (details) {
        _updateValue(details.localPosition.dx);
      },
      child: SizedBox(
        width: widget.width,
        height: widget.height,
        child: Stack(
          alignment: Alignment.centerLeft,
          children: [
            // Track background
            Positioned(
              left: thumbSize / 2,
              child: Container(
                width: effectiveWidth,
                height: trackHeight,
                decoration: BoxDecoration(
                  color: SLIDER_TRACK_COLOR,
                  border: Border.all(color: Colors.black, width: 2),
                ),
              ),
            ),
            // Track fill
            Positioned(
              left: thumbSize / 2,
              child: Container(width: effectiveWidth * widget.value, height: trackHeight, color: SLIDER_FILL_COLOR),
            ),
            // Thumb
            Positioned(
              left: thumbPosition,
              child: Container(
                width: thumbSize,
                height: thumbSize,
                decoration: BoxDecoration(
                  color: SLIDER_THUMB_COLOR,
                  border: Border.all(color: SLIDER_THUMB_BORDER_COLOR, width: SLIDER_THUMB_BORDER_WIDTH),
                  boxShadow: _isDragging ? [BoxShadow(color: Colors.black54, blurRadius: 4, offset: const Offset(0, 2))] : null,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
