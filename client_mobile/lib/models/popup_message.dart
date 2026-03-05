class PopupMessage {
  const PopupMessage({
    required this.message,
    this.hasCloseButton = false,
    this.isConfirmation = false,
    this.popupColor = PopupColor.orange,
    this.action,
  });

  final String message;
  final bool hasCloseButton;
  final bool isConfirmation;
  final PopupColor popupColor;
  final void Function()? action;
}

enum PopupColor {
  orange,
  blue
}
