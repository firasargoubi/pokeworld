part of '../user_profile_popup.dart';

class _FriendsCardFace extends StatefulWidget {
  const _FriendsCardFace({required this.baseSize, required this.onBackToFront});

  final double baseSize;
  final VoidCallback onBackToFront;

  @override
  State<_FriendsCardFace> createState() => _FriendsCardFaceState();
}

class _FriendsCardFaceState extends State<_FriendsCardFace> {
  late final FriendsController _controller;
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _controller = FriendsController();
    _searchController = TextEditingController(text: _controller.searchQuery);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double baseSize = widget.baseSize;
    if (_searchController.text != _controller.searchQuery) {
      _searchController.value = TextEditingValue(
        text: _controller.searchQuery,
        selection: TextSelection.collapsed(offset: _controller.searchQuery.length),
      );
    }

    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) => Column(
        children: [
          Expanded(
            flex: 1,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  flex: 4,
                  child: _CardTitleRow(title: I18nService().translate(FRIENDS_DISPLAY_TITLE), baseSize: baseSize),
                ),
                Expanded(
                  flex: 4,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      _FriendsTabButton(
                        baseSize: baseSize,
                        assetPath: ASSET_ICON_SEARCH,
                        isActive: _controller.isActive(SocialListTab.Search),
                        onPressed: () => _controller.selectTab(SocialListTab.Search),
                      ),
                      SizedBox(width: baseSize * FRIENDS_TAB_GAP_FACTOR),
                      _FriendsTabButton(
                        baseSize: baseSize,
                        assetPath: ASSET_ICON_FRIENDS,
                        isActive: _controller.isActive(SocialListTab.Friends),
                        onPressed: () => _controller.selectTab(SocialListTab.Friends),
                      ),
                      SizedBox(width: baseSize * FRIENDS_TAB_GAP_FACTOR),
                      _FriendsTabButton(
                        baseSize: baseSize,
                        assetPath: ASSET_ICON_MAIL,
                        assetColor: null,
                        isActive: _controller.isActive(SocialListTab.ReceivedRequests),
                        onPressed: () => _controller.selectTab(SocialListTab.ReceivedRequests),
                      ),
                      SizedBox(width: baseSize * FRIENDS_TAB_GAP_FACTOR),
                      _FriendsTabButton(
                        baseSize: baseSize,
                        assetPath: ASSET_ICON_BLOCK,
                        assetColor: FRIENDS_BLOCKED_TAB_ICON_COLOR,
                        isActive: _controller.isActive(SocialListTab.Blocked),
                        onPressed: () => _controller.selectTab(SocialListTab.Blocked),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      _CardActionButton(icon: Icons.settings, onPressed: widget.onBackToFront, baseSize: baseSize, assetPath: ASSET_ICON_BACK_ARROW),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 3,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: baseSize * FRIENDS_SEARCH_BAR_PADDING_FACTOR),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _FriendsSearchBar(baseSize: baseSize, controller: _searchController, onChanged: _controller.setSearchQuery),
                  SizedBox(height: baseSize * FRIENDS_SEARCH_BAR_PADDING_FACTOR),
                  Expanded(
                    child: _FriendsSearchSection(baseSize: baseSize, controller: _controller),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
