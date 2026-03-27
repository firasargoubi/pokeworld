part of '../user_profile_popup.dart';

class _UpperCaseInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase(), selection: newValue.selection);
  }
}

class _FriendsSearchBar extends StatelessWidget {
  const _FriendsSearchBar({required this.baseSize, required this.controller, required this.onChanged});

  final double baseSize;
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: baseSize * FRIENDS_SEARCH_BAR_HEIGHT_FACTOR,
      child: EdgeBodyButton(
        leftEdgePath: ASSET_BUTTON_EDGE_1,
        rightEdgePath: ASSET_BUTTON_EDGE_2,
        bodyPath: ASSET_BUTTON_BODY,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: baseSize * FRIENDS_SEARCH_BAR_PADDING_FACTOR),
          child: TextField(
            controller: controller,
            onChanged: onChanged,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              isDense: true,
              hintText: I18nService().translate(USER_POPUP_SEARCH_PLACEHOLDER),
              hintStyle: LABEL_TEXT_STYLE(baseSize * FRIENDS_SEARCH_INPUT_TEXT_FACTOR).copyWith(color: const Color(0xFFE0E0E0), shadows: const []),
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
            style: LABEL_TEXT_STYLE(baseSize * FRIENDS_SEARCH_INPUT_TEXT_FACTOR).copyWith(color: Colors.white, shadows: const []),
            cursorColor: const Color(0xFF4e5257),
            textAlignVertical: TextAlignVertical.center,
            inputFormatters: [_UpperCaseInputFormatter(), LengthLimitingTextInputFormatter(MAX_USERNAME_LENGTH)],
          ),
        ),
      ),
    );
  }
}

class _FriendsSearchSection extends StatelessWidget {
  const _FriendsSearchSection({required this.baseSize, required this.controller});

  final double baseSize;
  final FriendsController controller;

  @override
  Widget build(BuildContext context) {
    if (controller.isLoading) {
      return Center(child: _FriendsLoadingIndicator(baseSize: baseSize));
    }

    if (controller.relationshipsToDisplay.isEmpty) {
      return Center(
        child: Text(
          I18nService().translate(USER_POPUP_NO_USERS_FOUND),
          style: LABEL_TEXT_STYLE(baseSize * FRIENDS_RESULT_NAME_TEXT_FACTOR).copyWith(color: Colors.white, shadows: const []),
        ),
      );
    }

    return ListView.separated(
      padding: EdgeInsets.zero,
      itemCount: controller.relationshipsToDisplay.length,
      separatorBuilder: (_, _) => SizedBox(height: baseSize * FRIENDS_RESULT_LIST_SPACING_FACTOR),
      itemBuilder: (BuildContext context, int index) {
        final SocialListItem relationship = controller.relationshipsToDisplay[index];
        return _FriendsSearchListItem(baseSize: baseSize, relationship: relationship, controller: controller);
      },
    );
  }
}

class _FriendsLoadingIndicator extends StatefulWidget {
  const _FriendsLoadingIndicator({required this.baseSize});

  final double baseSize;

  @override
  State<_FriendsLoadingIndicator> createState() => _FriendsLoadingIndicatorState();
}

class _FriendsLoadingIndicatorState extends State<_FriendsLoadingIndicator> with SingleTickerProviderStateMixin {
  late final AnimationController _spinController;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat();
  }

  @override
  void dispose() {
    _spinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double spinnerSize = widget.baseSize * 0.08;
    return SizedBox(
      width: spinnerSize,
      height: spinnerSize,
      child: AnimatedBuilder(
        animation: _spinController,
        child: Image.asset(ASSET_TITLE_ICON, fit: BoxFit.contain, filterQuality: FilterQuality.none),
        builder: (BuildContext context, Widget? child) {
          return Transform.rotate(angle: _spinController.value * math.pi, child: child);
        },
      ),
    );
  }
}

class _FriendsSearchListItem extends StatelessWidget {
  const _FriendsSearchListItem({required this.baseSize, required this.relationship, required this.controller});

  final double baseSize;
  final SocialListItem relationship;
  final FriendsController controller;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: baseSize * FRIENDS_RESULT_ITEM_HEIGHT_FACTOR,
      child: EdgeBodyButton(
        leftEdgePath: ASSET_BUTTON_EDGE_1,
        rightEdgePath: ASSET_BUTTON_EDGE_2,
        bodyPath: ASSET_BUTTON_BODY,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: baseSize * FRIENDS_RESULT_ITEM_PADDING_FACTOR),
          child: Row(
            children: [
              Expanded(
                flex: 6,
                child: Row(
                  children: [
                    SizedBox(
                      width: baseSize * FRIENDS_RESULT_AVATAR_RADIUS_FACTOR * 2,
                      height: baseSize * FRIENDS_RESULT_AVATAR_RADIUS_FACTOR * 2,
                      child: Image(
                        image: profilePictureImageProvider(relationship.user.profilePicture, fallback: const AssetImage(ASSET_DEFAULT_AVATAR)),
                        fit: BoxFit.cover,
                      ),
                    ),
                    SizedBox(width: baseSize * FRIENDS_RESULT_ITEM_PADDING_FACTOR),
                    Expanded(
                      child: Text(
                        relationship.user.username,
                        style: LABEL_TEXT_STYLE(baseSize * FRIENDS_RESULT_NAME_TEXT_FACTOR).copyWith(shadows: const []),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 4,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: _actionsForRelation(baseSize: baseSize),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _actionsForRelation({required double baseSize}) {
    final String userId = relationship.user.userId;
    switch (relationship.relation) {
      case RelationshipType.None:
        return [
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_ADD_FRIEND,
            iconColor: null,
            onPressed: () => controller.sendFriendRequest(userId),
          ),
          SizedBox(width: baseSize * FRIENDS_RESULT_LIST_SPACING_FACTOR),
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_BLOCK,
            iconColor: FRIENDS_BLOCKED_TAB_ICON_COLOR,
            onPressed: () => controller.blockUser(userId),
          ),
        ];
      case RelationshipType.PendingSent:
        return [
          _FriendsRelationActionButton(baseSize: baseSize, assetPath: ASSET_ICON_PENDING_INVITATION, iconColor: null, onPressed: null),
          SizedBox(width: baseSize * FRIENDS_RESULT_LIST_SPACING_FACTOR),
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_BLOCK,
            iconColor: FRIENDS_BLOCKED_TAB_ICON_COLOR,
            onPressed: () => controller.blockUser(userId),
          ),
        ];
      case RelationshipType.PendingReceived:
        return [
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_ADD_FRIEND,
            iconColor: null,
            onPressed: () => controller.acceptFriendRequest(userId),
          ),
          SizedBox(width: baseSize * FRIENDS_RESULT_LIST_SPACING_FACTOR),
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_REMOVE_FRIEND,
            iconColor: null,
            onPressed: () => controller.declineFriendRequest(userId),
          ),
          SizedBox(width: baseSize * FRIENDS_RESULT_LIST_SPACING_FACTOR),
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_BLOCK,
            iconColor: FRIENDS_BLOCKED_TAB_ICON_COLOR,
            onPressed: () => controller.blockUser(userId),
          ),
        ];
      case RelationshipType.Friend:
        return [
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_REMOVE_FRIEND,
            iconColor: null,
            onPressed: () => controller.removeFriend(userId),
          ),
          SizedBox(width: baseSize * FRIENDS_RESULT_LIST_SPACING_FACTOR),
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_BLOCK,
            iconColor: FRIENDS_BLOCKED_TAB_ICON_COLOR,
            onPressed: () => controller.blockUser(userId),
          ),
        ];
      case RelationshipType.Blocked:
        return [
          _FriendsRelationActionButton(
            baseSize: baseSize,
            assetPath: ASSET_ICON_BLOCK,
            iconColor: FRIENDS_ACTION_UNBLOCK_ICON_COLOR,
            onPressed: () => controller.unblockUser(userId),
          ),
        ];
    }
  }
}

class _FriendsRelationActionButton extends StatelessWidget {
  const _FriendsRelationActionButton({required this.baseSize, required this.assetPath, required this.iconColor, required this.onPressed});

  final double baseSize;
  final String assetPath;
  final Color? iconColor;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final bool isSvgAsset = assetPath.toLowerCase().endsWith('.svg');
    return SizedBox(
      width: baseSize * FRIENDS_ACTION_BUTTON_SIZE_FACTOR,
      height: baseSize * FRIENDS_ACTION_BUTTON_SIZE_FACTOR,
      child: EdgeBodyButton(
        leftEdgePath: ASSET_BUTTON_EDGE_1,
        rightEdgePath: ASSET_BUTTON_EDGE_2,
        bodyPath: ASSET_BUTTON_BODY,
        opacity: onPressed == null ? 0.8 : null,
        onAction: onPressed,
        child: SizedBox.square(
          dimension: baseSize * FRIENDS_TAB_ICON_SIZE_FACTOR,
          child: isSvgAsset
              ? SvgPicture.asset(
                  assetPath,
                  fit: BoxFit.contain,
                  colorFilter: iconColor == null ? null : ColorFilter.mode(iconColor!, BlendMode.srcIn),
                )
              : Image.asset(assetPath, fit: BoxFit.contain, color: iconColor, filterQuality: FilterQuality.none),
        ),
      ),
    );
  }
}

class _FriendsTabButton extends StatelessWidget {
  const _FriendsTabButton({
    required this.baseSize,
    required this.isActive,
    required this.onPressed,
    this.assetPath,
    this.assetColor = FRIENDS_TAB_ASSET_ICON_COLOR,
    this.icon,
  }) : assert(assetPath != null || icon != null, 'Provide either assetPath or icon');

  final double baseSize;
  final bool isActive;
  final VoidCallback onPressed;
  final String? assetPath;
  final Color? assetColor;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final bool isSvgAsset = assetPath?.toLowerCase().endsWith('.svg') ?? false;
    final Widget iconWidget = assetPath != null
        ? SizedBox.square(
            dimension: baseSize * FRIENDS_TAB_ICON_SIZE_FACTOR,
            child: isSvgAsset
                ? SvgPicture.asset(
                    assetPath!,
                    fit: BoxFit.contain,
                    colorFilter: assetColor == null ? null : ColorFilter.mode(assetColor!, BlendMode.srcIn),
                  )
                : Image.asset(assetPath!, fit: BoxFit.contain, color: assetColor, filterQuality: FilterQuality.none),
          )
        : Icon(icon, size: baseSize * FRIENDS_TAB_ICON_SIZE_FACTOR, color: Colors.white);

    return AnimatedScale(
      duration: FRIENDS_TAB_ANIMATION_DURATION,
      scale: isActive ? 1 : FRIENDS_TAB_ACTIVE_SCALE,
      child: SizedBox(
        width: baseSize * FRIENDS_TAB_BUTTON_SIZE_FACTOR,
        height: baseSize * FRIENDS_TAB_BUTTON_SIZE_FACTOR,
        child: EdgeBodyButton(
          leftEdgePath: ASSET_BUTTON_EDGE_1,
          rightEdgePath: ASSET_BUTTON_EDGE_2,
          bodyPath: ASSET_BUTTON_BODY,
          opacity: isActive ? null : FRIENDS_TAB_ACTIVE_OPACITY,
          onAction: isActive ? null : onPressed,
          child: iconWidget,
        ),
      ),
    );
  }
}
