import 'dart:ui';

enum UserCardView { front, settings, friends, inventory }

enum LoginPopupView { login, register }

class DefaultContainerConfig {
  const DefaultContainerConfig({
    this.borderWidthFactor = 0.04,
    this.innerBorderWidthFactor = 0.025,
    this.separatorHeightFactor = 0.025,
    this.backgroundRatio,
    this.borderColor = const Color(0xFF484860),
    this.innerBorderBottomRightColor,
    this.innerBorderTopLeftColor,
    this.backgroundTopColor,
    this.backgroundBottomColor,
    this.closeButtonFactor = 0.05,
    this.closeButtonTopFactor,
    this.closeButtonRightFactor,
  });

  final double borderWidthFactor;
  final double innerBorderWidthFactor;
  final double separatorHeightFactor;
  final double? backgroundRatio;
  final Color borderColor;
  final Color? innerBorderBottomRightColor;
  final Color? innerBorderTopLeftColor;
  final Color? backgroundTopColor;
  final Color? backgroundBottomColor;
  final double? closeButtonFactor;
  final double? closeButtonTopFactor;
  final double? closeButtonRightFactor;
}
