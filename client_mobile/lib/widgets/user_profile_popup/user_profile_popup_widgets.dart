part of 'user_profile_popup.dart';

class _CardActionButton extends StatelessWidget {
  const _CardActionButton({required this.icon, required this.onPressed, required this.assetPath, required this.baseSize});

  final IconData icon;
  final VoidCallback onPressed;
  final String assetPath;
  final double baseSize;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: baseSize * 0.1,
    height: baseSize * 0.1,
    child: EdgeBodyButton(
      leftEdgePath: ASSET_BUTTON_EDGE_1,
      rightEdgePath: ASSET_BUTTON_EDGE_2,
      bodyPath: ASSET_BUTTON_BODY,
      onAction: () => onPressed(),
      child: SizedBox.square(
        dimension: baseSize * 0.06,
        child: Image.asset(assetPath, fit: BoxFit.contain, color: Colors.white, filterQuality: FilterQuality.none),
      ),
    ),
  );
}

class _CardTitleRow extends StatelessWidget {
  const _CardTitleRow({required this.title, required this.baseSize});

  final String title;
  final double baseSize;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.start,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Image.asset(
        ASSET_TITLE_ICON,
        width: baseSize * 0.07,
        height: baseSize * 0.07,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.none,
      ),
      SizedBox(width: baseSize * 0.02),
      Text(title, style: TITLE_TEXT_STYLE(baseSize * 0.07)),
      SizedBox(width: baseSize * 0.02),
      Image.asset(
        ASSET_TITLE_ICON,
        width: baseSize * 0.07,
        height: baseSize * 0.07,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.none,
      ),
    ],
  );
}

class _CardInfoRow extends StatelessWidget {
  const _CardInfoRow({required this.label, required this.value, required this.baseSize});

  final String label;
  final String value;
  final double baseSize;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: baseSize * 0.07,
    width: double.infinity,
    child: EdgeBodyButton(
      leftEdgePath: ASSET_SUB_CONTAINER_EDGE_1,
      rightEdgePath: ASSET_SUB_CONTAINER_EDGE_2,
      bodyPath: ASSET_SUB_CONTAINER_BODY,
      opacity: 0.3,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02, vertical: baseSize * 0.01),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(label, style: LABEL_TEXT_STYLE(baseSize * 0.035)),
            Text(value, style: LABEL_TEXT_STYLE(baseSize * 0.035)),
          ],
        ),
      ),
    ),
  );
}

class _CardSettingsRow extends StatelessWidget {
  const _CardSettingsRow({
    required this.label,
    required this.baseSize,
    required this.controller,
    this.onChanged,
    this.obscureText = false,
    this.inputFormatters,
    this.action,
  });

  final String label;
  final double baseSize;
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  final bool obscureText;
  final List<TextInputFormatter>? inputFormatters;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    spacing: baseSize * 0.02,
    children: [
      Expanded(
        flex: 4,
        child: SizedBox(
          height: baseSize * 0.07,
          child: EdgeBodyButton(
            leftEdgePath: ASSET_SUB_CONTAINER_EDGE_1,
            rightEdgePath: ASSET_SUB_CONTAINER_EDGE_2,
            bodyPath: ASSET_SUB_CONTAINER_BODY,
            opacity: 0.3,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: baseSize * 0.02, vertical: baseSize * 0.005),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(label, style: LABEL_TEXT_STYLE(baseSize * 0.035)),
                  SizedBox(
                    width: baseSize * 0.3,
                    child: CutCornerBorderContainer(
                      backgroundColor: const Color(0xFFb1e0f4),
                      borderColor: const Color(0xFF5c93cb),
                      borderWidth: baseSize * 0.007,
                      child: TextField(
                        controller: controller,
                        obscureText: obscureText,
                        onChanged: onChanged,
                        inputFormatters: inputFormatters,
                        decoration: InputDecoration(
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(horizontal: baseSize * 0.02, vertical: baseSize * 0.01),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: BorderSide.none),
                        ),
                        style: LABEL_TEXT_STYLE(baseSize * 0.035),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      Expanded(
        flex: 1,
        child: SizedBox(height: baseSize * 0.07, width: double.infinity, child: action),
      ),
    ],
  );
}

class _CardUpdateButton extends StatelessWidget {
  const _CardUpdateButton({required this.baseSize, this.onPressed, this.isLoading = false});

  final double baseSize;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) => EdgeBodyButton(
    leftEdgePath: ASSET_BUTTON_EDGE_1,
    rightEdgePath: ASSET_BUTTON_EDGE_2,
    bodyPath: ASSET_BUTTON_BODY,
    onAction: (isLoading || onPressed == null) ? null : onPressed,
    child: isLoading
        ? SizedBox(
            width: baseSize * 0.03,
            height: baseSize * 0.03,
            child: const CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [Text(I18nService().translate(UPDATE_BUTTON_LABEL), style: BUTTON_TEXT_STYLE(baseSize * 0.035))],
          ),
  );
}

class _CardBadgeSlot extends StatelessWidget {
  const _CardBadgeSlot({required this.baseSize});

  final double baseSize;

  @override
  Widget build(BuildContext context) => Container(
    height: baseSize * 0.08,
    width: baseSize * 0.08,
    decoration: const BoxDecoration(
      image: DecorationImage(
        image: AssetImage(ASSET_BADGE_CONTAINER),
        fit: BoxFit.fill,
        filterQuality: FilterQuality.none,
      ),
    ),
  );
}
