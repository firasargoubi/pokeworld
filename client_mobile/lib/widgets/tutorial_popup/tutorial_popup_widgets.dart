import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/tutorial_popup/tutorial_popup_const.dart';
import 'package:flutter/material.dart';

class CardTitleRow extends StatelessWidget {
  const CardTitleRow({required this.title, required this.baseSize, super.key});

  final String title;
  final double baseSize;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.start,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Image.asset(ASSET_TITLE_ICON, width: baseSize * 0.07, height: baseSize * 0.07, fit: BoxFit.contain, filterQuality: FilterQuality.none),
      SizedBox(width: baseSize * 0.02),
      Text(title, style: TITLE_TEXT_STYLE(baseSize * 0.06)),
    ],
  );
}

class TranslatedRichText extends StatelessWidget {
  const TranslatedRichText({required this.translationKey, required this.fontSize, this.capitalize = false, super.key});

  final String translationKey;
  final double fontSize;
  final bool capitalize;

  static final RegExp _tagRegex = RegExp(r'<([^>]+)>');

  List<TextSpan> _parseSpans(String line) {
    final List<TextSpan> spans = [];
    int lastEnd = 0;
    for (final Match match in _tagRegex.allMatches(line)) {
      if (match.start > lastEnd) {
        spans.add(TextSpan(text: line.substring(lastEnd, match.start), style: LABEL_TEXT_STYLE(fontSize)));
      }
      spans.add(TextSpan(text: match.group(1), style: HIGHLIGHT_LABEL_TEXT_STYLE(fontSize)));
      lastEnd = match.end;
    }
    if (lastEnd < line.length) {
      spans.add(TextSpan(text: line.substring(lastEnd), style: LABEL_TEXT_STYLE(fontSize)));
    }
    return spans;
  }

  @override
  Widget build(BuildContext context) {
    final String rawText = I18nService().translate(translationKey);
    final String text = capitalize ? rawText.toUpperCase() : rawText;
    final List<String> lines = text.split('\n');

    if (lines.length == 1) {
      return Text.rich(TextSpan(children: _parseSpans(text)));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((line) {
        if (line.startsWith('- ')) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('- ', style: LABEL_TEXT_STYLE(fontSize)),
              Expanded(child: Text.rich(TextSpan(children: _parseSpans(line.substring(2))))),
            ],
          );
        }
        return Text.rich(TextSpan(children: _parseSpans(line)));
      }).toList(),
    );
  }
}
