import 'package:client_mobile/consts/menu_card_data.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/widgets/default_container/default_container.dart';
import 'package:flutter/material.dart';

import 'menu_card_const.dart';

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
    this.buttonImage = MENU_CARD_DEFAULT_BUTTON_IMAGE,
    this.buttonImageActive = MENU_CARD_DEFAULT_BUTTON_IMAGE_ACTIVE,
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
    final innerBorderBottomRightColor = !_isPressed ? config.innerBorderBottomRightColor : config.innerBorderTopLeftColor;
    final innerBorderTopLeftColor = !_isPressed ? config.innerBorderTopLeftColor : config.innerBorderBottomRightColor;
    final pokemonImage = config.pokemonImage;
    final pokemonWidthFactor = config.pokemonWidthFactor;
    final pokemonHeightFactor = config.pokemonHeightFactor;
    final currentButtonImage = _isPressed ? widget.buttonImageActive : widget.buttonImage;

    return GestureDetector(
      onTapDown: (_) => {setState(() => _isPressed = true), AudioService().playSoundEffect(SoundEffect.Select.path)},
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: DefaultContainer(
          baseSize: widget.size,
          config: DefaultContainerConfig(
            backgroundRatio: 0.63,
            borderColor: config.borderColor,
            backgroundTopColor: config.backgroundTopColor,
            backgroundBottomColor: config.backgroundBottomColor,
            innerBorderBottomRightColor: innerBorderBottomRightColor,
            innerBorderTopLeftColor: innerBorderTopLeftColor,
          ),

          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: widget.size * MENU_CARD_TITLE_TOP_FACTOR,
                left: widget.size * MENU_CARD_TITLE_LEFT_FACTOR,
                child: Text(
                  widget.title,
                  style: TextStyle(
                    fontFamily: MENU_CARD_FONT_FAMILY,
                    color: Colors.white,
                    fontSize: widget.size * MENU_CARD_TITLE_FONT_FACTOR,
                    height: MENU_CARD_TITLE_HEIGHT,
                    shadows: [
                      Shadow(offset: Offset(widget.size * MENU_CARD_TITLE_SHADOW_OFFSET_FACTOR, 0), color: MENU_CARD_SHADOW_COLOR, blurRadius: 0),
                    ],
                  ),
                ),
              ),
              if (currentButtonImage != null)
                Positioned(
                  bottom: widget.size * MENU_CARD_BUTTON_BOTTOM_FACTOR,
                  left: widget.size * MENU_CARD_BUTTON_LEFT_FACTOR,
                  child: Container(
                    width: widget.size * MENU_CARD_BUTTON_SIZE_FACTOR,
                    height: widget.size * MENU_CARD_BUTTON_SIZE_FACTOR,
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
                right: -widget.size * MENU_CARD_POKEMON_RIGHT_FACTOR,
                child: Container(
                  width: widget.size * MENU_CARD_POKEMON_WIDTH_FACTOR * pokemonWidthFactor,
                  height: widget.size * MENU_CARD_POKEMON_HEIGHT_FACTOR * pokemonHeightFactor,
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
