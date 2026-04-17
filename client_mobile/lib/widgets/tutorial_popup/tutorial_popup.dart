import 'dart:math' as math;
import 'dart:ui';

import 'package:client_mobile/models/user_preferences.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/widgets/cut_corner_container/cut_corner_container.dart';
import 'package:client_mobile/widgets/edge_body_button/edge_body_button.dart';
import 'package:client_mobile/widgets/stat_container/stat_container.dart';
import 'package:client_mobile/widgets/tutorial_popup/tutorial_popup_const.dart';
import 'package:client_mobile/widgets/tutorial_popup/tutorial_popup_controller.dart';
import 'package:client_mobile/widgets/tutorial_popup/tutorial_popup_widgets.dart';
import 'package:flutter/material.dart';

Future<void> showTutorialPopup(BuildContext context) {
  return showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: DIALOG_BARRIER_COLOR,
    builder: (_) => BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
      child: const Material(
        type: MaterialType.transparency,
        child: Center(child: TutorialPopup()),
      ),
    ),
  );
}

class TutorialPopup extends StatefulWidget {
  const TutorialPopup({super.key});

  @override
  State<TutorialPopup> createState() => _TutorialPopupState();
}

class _TutorialPopupState extends State<TutorialPopup> {
  final TutorialPopupController _controller = TutorialPopupController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _controller.init();
    _controller.addListener(_onControllerChange);
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChange);
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onControllerChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double keyboardInsetBottom = MediaQuery.of(context).viewInsets.bottom;
        final double availableWidth = constraints.maxWidth;
        final double availableHeight = constraints.maxHeight - keyboardInsetBottom;

        final double popupReferenceWidth;
        final double popupReferenceHeight;

        if (availableWidth / availableHeight > ASPECT_RATIO) {
          popupReferenceHeight = availableHeight;
          popupReferenceWidth = popupReferenceHeight * ASPECT_RATIO;
        } else {
          popupReferenceWidth = availableWidth;
          popupReferenceHeight = popupReferenceWidth / ASPECT_RATIO;
        }

        final double baseSize = math.min(popupReferenceWidth, popupReferenceHeight);
        final double popupHeight = baseSize * 0.95;
        final double popupWidth = baseSize * 1.2;

        return SizedBox(
          height: popupHeight,
          width: popupWidth,
          child: FramedContainer(
            style: USER_CARD_STYLE,
            baseSize: baseSize * 0.1,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Positioned(
                  top: -baseSize * 0.022,
                  left: -baseSize * 0.019,
                  child: Image.asset(
                    ASSET_CARD_ICON_BG,
                    height: baseSize * 0.6,
                    fit: BoxFit.contain,
                    filterQuality: FilterQuality.none,
                    opacity: const AlwaysStoppedAnimation<double>(0.4),
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  spacing: baseSize * 0.01,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        CardTitleRow(
                          title:
                              '${I18nService().translate(TITLE_LABEL)} ${_controller.currentTutorialStep?.mainProgressText ?? ''} : ${I18nService().translate(_controller.currentTutorialStep!.mainTitleLabel).toUpperCase()}',
                          baseSize: baseSize * 0.8,
                        ),
                        SizedBox(
                          height: baseSize * 0.08,
                          width: baseSize * 0.1,
                          child: EdgeBodyButton(
                            leftEdgePath: RED_BUTTON_EDGE_LEFT_ASSET_PATH,
                            rightEdgePath: RED_BUTTON_EDGE_RIGHT_ASSET_PATH,
                            bodyPath: RED_BUTTON_BODY_ASSET_PATH,
                            onAction: () => Navigator.of(context).pop(),
                            child: SizedBox.square(
                              dimension: baseSize * 0.06,
                              child: Image.asset(ASSET_TUTORIAL_CLOSE, fit: BoxFit.contain, color: Colors.white, filterQuality: FilterQuality.none),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                      height: baseSize * 0.37,
                      width: double.infinity,
                      child: Stack(
                        children: [
                          CutCornerBorderContainer(
                            backgroundColor: IMAGE_INPUT_BG_COLOR,
                            borderColor: IMAGE_INPUT_BORDER_COLOR,
                            borderWidth: baseSize * 0.008,
                            child: Builder(
                              builder: (context) {
                                final assetPath = I18nService().currentLanguage == AppLanguage.French
                                    ? _controller.currentTutorialStep?.imagePathFr ?? ''
                                    : _controller.currentTutorialStep?.imagePathEn ?? '';

                                if (assetPath.isNotEmpty) {
                                  final double devicePixelRatio = MediaQuery.of(context).devicePixelRatio;
                                  final int decodeWidth = (popupWidth * devicePixelRatio).round();
                                  final int decodeHeight = (baseSize * 0.37 * devicePixelRatio).round();
                                  return Image.asset(
                                    assetPath,
                                    fit: BoxFit.fill,
                                    filterQuality: FilterQuality.none,
                                    cacheWidth: decodeWidth > 0 ? decodeWidth : null,
                                    cacheHeight: decodeHeight > 0 ? decodeHeight : null,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Center(child: Text(assetPath));
                                    },
                                  );
                                } else {
                                  return Center(
                                    child: Text(I18nService().translate('tutorial_no_image'), style: const TextStyle(color: Colors.white)),
                                  );
                                }
                              },
                            ),
                          ),
                          Builder(
                            builder: (context) {
                              final step = _controller.currentTutorialStep;
                              if (step?.displayProfessorLeft == null) return const SizedBox.shrink();
                              final isLeft = step!.displayProfessorLeft!;
                              final hOffset = baseSize * (step.professorOffset ?? 0.0);
                              return Positioned(
                                bottom: 0,
                                left: isLeft ? hOffset : null,
                                right: isLeft ? null : hOffset,
                                child: Transform.scale(
                                  scaleX: isLeft ? -1 : 1,
                                  child: Image.asset(
                                    ASSET_PROFESSOR_CHEN,
                                    width: baseSize * 0.23,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: baseSize * 0.01,
                      width: double.infinity,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _controller.currentTutorialStep?.totalSubTitlesInMainTitle ?? 0,
                          (i) => Expanded(
                            child: Padding(
                              padding: EdgeInsets.symmetric(horizontal: baseSize * 0.003),
                              child: Opacity(
                                opacity: i < (_controller.currentTutorialStep?.subTitleIndexInMainTitle ?? 0) ? 1.0 : 0.3,
                                child: const ColoredBox(color: Colors.white, child: SizedBox.expand()),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: SizedBox(
                        width: double.infinity,
                        child: CutCornerBorderContainer(
                          backgroundColor: IMAGE_INPUT_BG_COLOR,
                          borderColor: IMAGE_INPUT_BORDER_COLOR,
                          borderWidth: baseSize * 0.008,
                          padding: EdgeInsets.all(baseSize * 0.01),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TranslatedRichText(
                                translationKey: _controller.currentTutorialStep!.subTitleLabel,
                                fontSize: baseSize * 0.035,
                                capitalize: true,
                              ),
                              SizedBox(height: baseSize * 0.005),
                              Expanded(
                                child: Scrollbar(
                                  thumbVisibility: true,
                                  controller: _scrollController,
                                  child: SingleChildScrollView(
                                    controller: _scrollController,
                                    child: TranslatedRichText(
                                      translationKey: _controller.currentTutorialStep!.description,
                                      fontSize: baseSize * 0.03,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    SizedBox(
                      height: baseSize * 0.10,
                      width: double.infinity,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Opacity(
                            opacity: _controller.isFirstStep ? 0.3 : 1.0,
                            child: SizedBox(
                              height: baseSize * 0.09,
                              width: baseSize * 0.12,
                              child: EdgeBodyButton(
                                leftEdgePath: ASSET_BUTTON_EDGE_1,
                                rightEdgePath: ASSET_BUTTON_EDGE_2,
                                bodyPath: ASSET_BUTTON_BODY,
                                onAction: _controller.isFirstStep ? null : () => _controller.goToPreviousStep(),
                                child: SizedBox.square(
                                  dimension: baseSize * 0.06,
                                  child: Image.asset(
                                    ASSET_TUTORIAL_ARROW_LEFT,
                                    fit: BoxFit.contain,
                                    color: Colors.white,
                                    filterQuality: FilterQuality.none,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: baseSize * 0.09,
                            width: baseSize * 0.42,
                            child: EdgeBodyButton(
                              leftEdgePath: ASSET_RED_BUTTON_EDGE_1,
                              rightEdgePath: ASSET_RED_BUTTON_EDGE_2,
                              bodyPath: ASSET_RED_BUTTON_BODY,
                              onAction: () => _controller.goToStep(0),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(I18nService().translate(RESET_BUTTON_LABEL).toUpperCase(), style: BUTTON_TEXT_STYLE(baseSize * 0.05)),
                                  SizedBox(width: baseSize * 0.01),
                                  SizedBox.square(
                                    dimension: baseSize * 0.06,
                                    child: Image.asset(
                                      ASSET_TUTORIAL_ARROW_RESET,
                                      fit: BoxFit.contain,
                                      color: Colors.white,
                                      filterQuality: FilterQuality.none,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Opacity(
                            opacity: _controller.isLastStep ? 0.3 : 1.0,
                            child: SizedBox(
                              height: baseSize * 0.09,
                              width: baseSize * 0.12,
                              child: EdgeBodyButton(
                                leftEdgePath: ASSET_BUTTON_EDGE_1,
                                rightEdgePath: ASSET_BUTTON_EDGE_2,
                                bodyPath: ASSET_BUTTON_BODY,
                                onAction: _controller.isLastStep ? null : () => _controller.goToNextStep(),
                                child: SizedBox.square(
                                  dimension: baseSize * 0.06,
                                  child: Image.asset(
                                    ASSET_TUTORIAL_ARROW_RIGHT,
                                    fit: BoxFit.contain,
                                    color: Colors.white,
                                    filterQuality: FilterQuality.none,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
