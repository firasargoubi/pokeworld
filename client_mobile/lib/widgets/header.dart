import 'package:flutter/material.dart';

class AppHeader extends StatefulWidget {
  final int index;
  final String text;
  final VoidCallback onTap;

  const AppHeader({
    super.key,
    required this.index,
    required this.text,
    required this.onTap,
  });

  @override
  State<AppHeader> createState() => _AppHeaderState();
}

class _AppHeaderState extends State<AppHeader> {
  bool _isPressed = false;

  // --- Constants (keeps behavior identical) ---
  static const double _FallbackHeight = 72.0;

  static const String _leftHeaderAsset =
      'assets/images/menu/headers/header-left.png';
  static const String _rightHeaderAsset =
      'assets/images/menu/headers/header-right.png';
  static const String _pressedButtonAsset =
      'assets/images/menu/headers/button.png';

  static const Color _shadowColor = Color(0xFF787878);
  static const String _fontFamily = 'Pixel';

  static int _normalizeIndex(int i) {
    if (i >= 1 && i <= 3) return i;
    if (i >= 0 && i <= 2) return i + 1;
    return 1;
  }

  void _setPressed(bool value) => setState(() => _isPressed = value);

  void _handleTapUp(_) {
    _setPressed(false);
    widget.onTap();
  }

  List<Shadow> _pixelShadow(double textSize) => [
    Shadow(
      offset: Offset(textSize * 0.08, 0),
      color: _shadowColor,
      blurRadius: 0,
    ),
  ];

  TextStyle _titleStyle(double textSize) => TextStyle(
    fontFamily: _fontFamily,
    color: Colors.white,
    fontSize: textSize,
    height: 1.0,
    shadows: _pixelShadow(textSize),
  );

  @override
  Widget build(BuildContext context) {
    final idx = _normalizeIndex(widget.index);
    final centerAsset = 'assets/images/menu/headers/header-center-$idx.png';

    return LayoutBuilder(
      builder: (context, constraints) {
        final headerHeight = constraints.hasBoundedHeight
            ? constraints.maxHeight
            : _FallbackHeight;

        final buttonSize = headerHeight * 0.60;
        final textSize = headerHeight * 0.55;
        final sidePadding = headerHeight * 0.22;

        return SizedBox(
          width: double.infinity,
          height: headerHeight,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // LEFT PART
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage(_leftHeaderAsset),
                      fit: BoxFit.fill,
                      filterQuality: FilterQuality.none,
                    ),
                  ),
                  child: Padding(
                    padding: EdgeInsets.only(
                      left: sidePadding,
                      top: headerHeight * 0.2,
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTapDown: (_) => _setPressed(true),
                          onTapCancel: () => _setPressed(false),
                          onTapUp: _handleTapUp,
                          child: SizedBox(
                            width: buttonSize,
                            height: buttonSize,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                if (_isPressed)
                                  Image.asset(
                                    _pressedButtonAsset,
                                    width: buttonSize,
                                    height: buttonSize,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                    color: Colors.white,
                                    colorBlendMode: BlendMode.srcIn,
                                  ),
                                Text(
                                  '<',
                                  style: _titleStyle(buttonSize * 0.75),
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(width: sidePadding),
                        Expanded(
                          child: Text(
                            widget.text,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: _titleStyle(textSize),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // CENTER IMAGE
              IntrinsicWidth(
                child: Center(
                  child: Image.asset(
                    centerAsset,
                    height: headerHeight,
                    fit: BoxFit.contain,
                    filterQuality: FilterQuality.none,
                  ),
                ),
              ),

              // RIGHT PART
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage(_rightHeaderAsset),
                      fit: BoxFit.fill,
                      filterQuality: FilterQuality.none,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
