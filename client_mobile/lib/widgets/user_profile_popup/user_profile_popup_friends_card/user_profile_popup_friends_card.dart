part of '../user_profile_popup.dart';

class _FriendsCardFace extends StatelessWidget {
  const _FriendsCardFace({required this.baseSize, required this.onBackToFront});

  final double baseSize;
  final VoidCallback onBackToFront;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          flex: 1,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                flex: 2,
                child: _CardTitleRow(title: I18nService().translate(FRIENDS_DISPLAY_TITLE), baseSize: baseSize),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [_CardActionButton(icon: Icons.settings, onPressed: onBackToFront, baseSize: baseSize, assetPath: ASSET_ICON_BACK_ARROW)],
                ),
              ),
            ],
          ),
        ),
        Expanded(flex: 3, child: Row(crossAxisAlignment: CrossAxisAlignment.start)),
        Expanded(
          flex: 1,
          child: Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(color: Colors.pink.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(8)),
          ),
        ),
      ],
    );
  }
}
