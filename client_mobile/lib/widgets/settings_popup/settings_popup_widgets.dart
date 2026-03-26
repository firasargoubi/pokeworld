import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
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
            Positioned(
              left: thumbSize / 2,
              child: Container(width: effectiveWidth * widget.value, height: trackHeight, color: SLIDER_FILL_COLOR),
            ),
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

class SettingsTabBar extends StatelessWidget {
  const SettingsTabBar({
    super.key,
    required this.selectedTab,
    required this.onTabSelected,
    required this.tabStyle,
    required this.audioLabel,
    required this.preferencesLabel,
    required this.baseSize,
  });

  final SettingsTab selectedTab;
  final ValueChanged<SettingsTab> onTabSelected;
  final TextStyle tabStyle;
  final String audioLabel;
  final String preferencesLabel;
  final double baseSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      spacing: baseSize * 0.05,
      children: [
        _TabButton(
          label: audioLabel,
          isActive: selectedTab == SettingsTab.audio,
          onTap: () => onTabSelected(SettingsTab.audio),
          style: tabStyle,
          baseSize: baseSize,
        ),
        _TabButton(
          label: preferencesLabel,
          isActive: selectedTab == SettingsTab.preferences,
          onTap: () => onTabSelected(SettingsTab.preferences),
          style: tabStyle,
          baseSize: baseSize,
        ),
      ],
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({required this.label, required this.isActive, required this.onTap, required this.style, required this.baseSize});

  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final TextStyle style;
  final double baseSize;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => {AudioService().playSoundEffect(SoundEffect.Select.path), onTap()},
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: baseSize * 0.01, vertical: baseSize * 0.005),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: isActive ? TAB_UNDERLINE_ACTIVE : TAB_UNDERLINE_INACTIVE, width: 2)),
        ),
        child: Text(label.toUpperCase(), style: style),
      ),
    );
  }
}

class OptionButton extends StatelessWidget {
  const OptionButton({super.key, required this.label, required this.isActive, required this.onTap, required this.style, required this.baseSize});

  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final TextStyle style;
  final double baseSize;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => {AudioService().playSoundEffect(SoundEffect.Select.path), onTap()},
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: baseSize * 0.03, vertical: baseSize * 0.015),
        decoration: BoxDecoration(
          color: isActive ? OPTION_BUTTON_ACTIVE_BG : OPTION_BUTTON_BG,
          border: Border.all(color: isActive ? OPTION_BUTTON_BORDER_ACTIVE : Colors.transparent, width: 2),
        ),
        child: Text(label.toUpperCase(), style: style),
      ),
    );
  }
}
