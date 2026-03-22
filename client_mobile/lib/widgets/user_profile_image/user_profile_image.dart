import 'package:flutter/material.dart';

class LayeredProfileImage extends StatelessWidget {
  const LayeredProfileImage({super.key, required this.foregroundImage});

  final ImageProvider foregroundImage;
  final String backgroundImage = 'assets/images/menu/buttons/poke-button/party-ball.png';

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Stack(
        fit: StackFit.expand,
        children: [
          Opacity(
            opacity: 0.7,
            child: Image(image: AssetImage(backgroundImage), filterQuality: FilterQuality.none, fit: BoxFit.fitWidth),
          ),
          Align(
            alignment: Alignment.center,
            child: FractionallySizedBox(
              heightFactor: 0.8,
              child: Image(image: foregroundImage, filterQuality: FilterQuality.none, fit: BoxFit.contain),
            ),
          ),
        ],
      ),
    );
  }
}
