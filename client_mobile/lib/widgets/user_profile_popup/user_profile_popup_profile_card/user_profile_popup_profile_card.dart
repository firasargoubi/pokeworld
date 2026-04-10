part of '../user_profile_popup.dart';

class _ProfileCardFace extends StatelessWidget {
  _ProfileCardFace({required this.baseSize, required this.onShowSettings, required this.onShowFriends, required this.onShowInventory});

  final double baseSize;
  final VoidCallback onShowSettings;
  final VoidCallback onShowFriends;
  final VoidCallback onShowInventory;

  final ProfileController _controller = ProfileController();

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<UserInfo?>(
      valueListenable: UserService().currentUser,
      builder: (context, user, _) {
        final username = user?.username ?? I18nService().translate(USER_POPUP_UNKNOWN_USER);
        final email = user?.email ?? I18nService().translate(USER_POPUP_UNKNOWN_EMAIL);
        final balance = user?.balance.toStringAsFixed(0) ?? '0';
        final avatar = profilePictureImageProvider(user?.fullProfilePicture, fallback: const AssetImage(ASSET_DEFAULT_AVATAR));

        return Column(
          children: [
            Expanded(
              flex: 1,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: _CardTitleRow(title: I18nService().translate(MY_ACCOUNT_TITLE), baseSize: baseSize),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      _CardActionButton(icon: Icons.inventory_2, onPressed: onShowInventory, baseSize: baseSize, assetPath: ASSET_ICON_ARCHIVE),
                      SizedBox(width: baseSize * 0.02),
                      _CardActionButton(icon: Icons.group, onPressed: onShowFriends, baseSize: baseSize, assetPath: ASSET_ICON_FRIENDS),
                      SizedBox(width: baseSize * 0.02),
                      _CardActionButton(icon: Icons.settings, onPressed: onShowSettings, baseSize: baseSize, assetPath: ASSET_ICON_SETTINGS),
                      SizedBox(width: baseSize * 0.02),
                      _CardActionButton(
                        icon: Icons.close,
                        onPressed: () => Navigator.of(context).pop(),
                        baseSize: baseSize,
                        assetPath: ASSET_ICON_CLOSE,
                        isCloseButton: true,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 3,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 4,
                    child: Container(
                      margin: EdgeInsets.only(left: baseSize * 0.02, right: baseSize * 0.02),
                      child: Column(
                        spacing: baseSize * 0.02,
                        children: [
                          _CardInfoRow(label: I18nService().translate(EMAIL_LABEL), value: email, baseSize: baseSize),
                          _CardInfoRow(label: I18nService().translate(BALANCE_LABEL), value: '$balance \$', baseSize: baseSize),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              SizedBox(
                                height: baseSize * 0.08,
                                width: baseSize * 0.26,
                                child: EdgeBodyButton(
                                  leftEdgePath: ASSET_BUTTON_EDGE_1,
                                  rightEdgePath: ASSET_BUTTON_EDGE_2,
                                  bodyPath: ASSET_BUTTON_BODY,
                                  onAction: () => _controller.showTutorial(context),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Text(I18nService().translate(TUTORIAL_LABEL).toUpperCase(), style: BUTTON_TEXT_STYLE(baseSize * 0.04)),
                                      SizedBox(width: baseSize * 0.01),
                                      Image.asset(
                                        height: baseSize * 0.04,
                                        TUTORIAL_ICON_ASSET,
                                        fit: BoxFit.contain,
                                        filterQuality: FilterQuality.none,
                                        color: Colors.white,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              SizedBox(
                                height: baseSize * 0.08,
                                width: baseSize * 0.37,
                                child: EdgeBodyButton(
                                  leftEdgePath: ASSET_DELETE_BUTTON_EDGE_1,
                                  rightEdgePath: ASSET_DELETE_BUTTON_EDGE_2,
                                  bodyPath: ASSET_DELETE_BUTTON_BODY,
                                  onAction: _controller.resetTutorial,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Text(I18nService().translate(TUTORIAL_RESET_LABEL).toUpperCase(), style: BUTTON_TEXT_STYLE(baseSize * 0.04)),
                                      SizedBox(width: baseSize * 0.01),
                                      Image.asset(
                                        height: baseSize * 0.04,
                                        RESET_ICON_ASSET,
                                        fit: BoxFit.contain,
                                        filterQuality: FilterQuality.none,
                                        color: Colors.white,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Container(
                      margin: EdgeInsets.only(left: baseSize * 0.02, right: baseSize * 0.02),
                      child: Column(
                        spacing: baseSize * 0.02,
                        children: [
                          _CardInfoRow(label: I18nService().translate(NAME_LABEL), value: username, baseSize: baseSize),
                          AspectRatio(
                            aspectRatio: 1,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Image.asset(ASSET_AVATAR_CONTAINER, fit: BoxFit.contain, filterQuality: FilterQuality.none, width: double.infinity),
                                FractionallySizedBox(
                                  widthFactor: 0.62,
                                  heightFactor: 0.62,
                                  child: Image(image: avatar, fit: BoxFit.cover, filterQuality: FilterQuality.none),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: baseSize * 0.07,
                            width: double.infinity,
                            child: EdgeBodyButton(
                              leftEdgePath: ASSET_BUTTON_EDGE_1,
                              rightEdgePath: ASSET_BUTTON_EDGE_2,
                              bodyPath: ASSET_BUTTON_BODY,
                              onAction: _controller.showLogoutConfirmation,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(I18nService().translate(USER_POPUP_LOGOUT).toUpperCase(), style: BUTTON_TEXT_STYLE(baseSize * 0.035)),
                                  SizedBox(width: baseSize * 0.01),
                                  Image.asset(
                                    height: baseSize * 0.04,
                                    ASSET_ICON_LOGOUT,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                    color: Colors.white,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: baseSize * 0.12,
              child: OverflowBox(
                maxWidth: baseSize * 1.06,
                alignment: Alignment.topCenter,
                child: Container(
                  margin: const EdgeInsets.only(top: 4),
                  width: baseSize * 12,
                  decoration: const BoxDecoration(
                    image: DecorationImage(image: AssetImage(ASSET_BADGES_CONTAINER), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    spacing: baseSize * 0.02,
                    children: [
                      _CardBadgeSlot(baseSize: baseSize),
                      _CardBadgeSlot(baseSize: baseSize),
                      _CardBadgeSlot(baseSize: baseSize),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
