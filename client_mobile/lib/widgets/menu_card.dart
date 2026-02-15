import 'package:client_mobile/models/menu_config.dart';
import 'package:flutter/material.dart';

import '../consts/menu_card_data.dart';

class MenuCard extends StatefulWidget {
  final double size;
  final MenuCardColor color;
  final String title;
  final String? buttonImage;
  final String? buttonImageActive;
  final VoidCallback? onTap;

  const MenuCard({
    super.key,
    required this.size,
    required this.color,
    required this.title,
    this.buttonImage = 'assets/images/menu/buttons/poke-button/party-ball.png',
    this.buttonImageActive =
        'assets/images/menu/buttons/poke-button/party-ball-sel.png',
    this.onTap,
  });

  @override
  State<MenuCard> createState() => _MenuCardState();
}

class _MenuCardState extends State<MenuCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final config = MENU_CARD_SETUP[widget.color]!;
    final backgroundImage = _isPressed
        ? config.activeBackgroundImage
        : config.backgroundImage;
    final pokemonImage = config.pokemonImage;
    final pokemonWidthFactor = config.pokemonWidthFactor;
    final pokemonHeightFactor = config.pokemonHeightFactor;
    final currentButtonImage = _isPressed
        ? widget.buttonImageActive
        : widget.buttonImage;

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(backgroundImage),
              fit: BoxFit.cover,
              filterQuality: FilterQuality.none,
            ),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: widget.size * 0.06,
                left: widget.size * 0.08,
                child: Text(
                  widget.title,
                  style: TextStyle(
                    fontFamily: 'Pixel',
                    color: Colors.white,
                    fontSize: widget.size * 0.2,
                    height: 0.8,
                    shadows: [
                      Shadow(
                        offset: Offset(widget.size * 0.015, 0),
                        color: const Color(0xFF787878),
                        blurRadius: 0,
                      ),
                    ],
                  ),
                ),
              ),
              if (currentButtonImage != null)
                Positioned(
                  bottom: widget.size * 0.015,
                  left: widget.size * 0.015,
                  child: Container(
                    width: widget.size * 0.55,
                    height: widget.size * 0.55,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: AssetImage(currentButtonImage),
                        fit: BoxFit.contain,
                        alignment: Alignment.center,
                        filterQuality: FilterQuality.none,
                      ),
                    ),
                  ),
                ),
              Positioned(
                bottom: 0,
                right: -widget.size * 0.05,
                child: Container(
                  width: widget.size * 0.83 * pokemonWidthFactor,
                  height: widget.size * 0.73 * pokemonHeightFactor,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage(pokemonImage),
                      fit: BoxFit.contain,
                      alignment: Alignment.bottomRight,
                      filterQuality: FilterQuality.none,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
