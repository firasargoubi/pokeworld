import 'package:flutter/material.dart';

class BinaryToggle extends StatelessWidget {
  const BinaryToggle({
    super.key,
    required this.leftSelected,
    required this.leftLabel,
    required this.rightLabel,
    required this.onChanged,
    this.enabled = true,
  });

  final bool leftSelected;
  final String leftLabel;
  final String rightLabel;
  final ValueChanged<bool> onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return ToggleButtons(
      isSelected: [leftSelected, !leftSelected],
      onPressed: enabled
          ? (index) {
              onChanged(index == 0);
            }
          : null,
      children: [
        Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text(leftLabel)),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text(rightLabel)),
      ],
    );
  }
}
