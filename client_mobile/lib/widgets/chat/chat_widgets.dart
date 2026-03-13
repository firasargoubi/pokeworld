import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/chat_message.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/utils/profile_image_provider.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../services/user_service/user_service.dart';
import '../../utils/time_utils.dart';
import 'chat_const.dart';

class ChatChannelButton extends StatelessWidget {
  const ChatChannelButton({super.key, required this.baseSize, required this.label, required this.isSelected, this.onTap});

  final double baseSize;
  final String label;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final height = baseSize * (isSelected ? CHAT_CHANNEL_HEIGHT_SELECTED_FACTOR : CHAT_CHANNEL_HEIGHT_UNSELECTED_FACTOR);
    final topPadding = baseSize * (isSelected ? CHAT_CHANNEL_TOP_PADDING_SELECTED_FACTOR : CHAT_CHANNEL_TOP_PADDING_UNSELECTED_FACTOR);
    final textHeight = baseSize * (isSelected ? CHAT_CHANNEL_TEXT_HEIGHT_SELECTED_FACTOR : CHAT_CHANNEL_TEXT_HEIGHT_UNSELECTED_FACTOR);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        onTap?.call();
        AudioService().playSoundEffect(SoundEffect.Select.path);
      },
      child: Container(
        width: baseSize * CHAT_CHANNEL_WIDTH_FACTOR,
        height: height,
        padding: EdgeInsets.only(top: topPadding),
        decoration: BoxDecoration(
          image: DecorationImage(
            image: const AssetImage(CHAT_CHANNEL_ASSET),
            fit: BoxFit.fitWidth,
            alignment: Alignment.topCenter,
            filterQuality: FilterQuality.none,
            colorFilter: ColorFilter.mode(isSelected ? CHAT_SELECTED_CHANNEL_COLOR : CHAT_UNSELECTED_CHANNEL_COLOR, BlendMode.srcIn),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: baseSize * CHAT_CHANNEL_ICON_SIZE_FACTOR,
              height: baseSize * CHAT_CHANNEL_ICON_SIZE_FACTOR,
              child: Padding(
                padding: EdgeInsets.all(baseSize * CHAT_CHANNEL_ICON_PADDING_FACTOR),
                child: SvgPicture.asset(
                  CHAT_MESSAGES_ICON_ASSET,
                  fit: BoxFit.contain,
                  colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                ),
              ),
            ),
            SizedBox(width: baseSize * CHAT_CHANNEL_GAP_FACTOR),
            Text(
              label,
              style: TextStyle(
                color: Colors.white,
                fontFamily: CHAT_FONT_FAMILY,
                fontSize: baseSize * CHAT_CHANNEL_TEXT_SIZE_FACTOR,
                height: textHeight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatHeader extends StatelessWidget {
  const ChatHeader({
    super.key,
    required this.baseSize,
    required this.selectedChannel,
    required this.onChannelChanged,
    required this.showMatchChannel,
  });

  final double baseSize;
  final ChatChannel selectedChannel;
  final ValueChanged<ChatChannel> onChannelChanged;
  final bool showMatchChannel;

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();
    return Container(
      height: baseSize * CHAT_HEADER_HEIGHT_FACTOR,
      width: double.infinity,
      color: CHAT_HEADER_BACKGROUND_COLOR,
      padding: EdgeInsets.symmetric(horizontal: baseSize * CHAT_HEADER_HORIZONTAL_PADDING_FACTOR),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          ChatChannelButton(
            baseSize: baseSize,
            label: i18n.translate(CHAT_GENERAL_LABEL_KEY),
            isSelected: selectedChannel == ChatChannel.General,
            onTap: () {
              onChannelChanged(ChatChannel.General);
              AudioService().playSoundEffect(SoundEffect.Select.path);
            },
          ),
          SizedBox(width: baseSize * CHAT_CHANNELS_GAP_FACTOR),
          if (showMatchChannel) ...{
            ChatChannelButton(
              baseSize: baseSize,
              label: i18n.translate(CHAT_PARTY_LABEL_KEY),
              isSelected: selectedChannel == ChatChannel.Match,
              onTap: () {
                onChannelChanged(ChatChannel.Match);
                AudioService().playSoundEffect(SoundEffect.Select.path);
              },
            ),
          },
        ],
      ),
    );
  }
}

class ChatMessagesList extends StatelessWidget {
  const ChatMessagesList({super.key, required this.baseSize, required this.messages, required this.scrollController});

  final double baseSize;
  final List<ChatMessage> messages;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: ListView.builder(
        controller: scrollController,
        itemCount: messages.length,
        itemBuilder: (context, index) {
          final message = messages[index];
          final isSelfSent = message.sender == UserService().currentUser.value?.username;

          return Padding(
            padding: EdgeInsets.only(left: baseSize * 0.1, bottom: baseSize * 0.03),
            child: Align(
              alignment: Alignment.centerLeft,
              child: RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: '[${formatTime(message.timestamp.toLocal())}] ',
                      style: TextStyle(
                        fontFamily: CHAT_FONT_FAMILY,
                        fontSize: baseSize * CHAT_MESSAGE_TEXT_SIZE_FACTOR,
                        color: CHAT_TIMESTAMP_COLOR,
                        shadows: [
                          Shadow(offset: Offset(baseSize * CHAT_MESSAGE_TEXT_SHADOW_OFFSET_FACTOR, 0), color: CHAT_TEXT_SHADOW_COLOR, blurRadius: 0),
                        ],
                      ),
                    ),
                    WidgetSpan(
                      child: Image(
                        image: profilePictureImageProvider(message.profilePicture),
                        width: baseSize * 0.35,
                        height: baseSize * CHAT_MESSAGE_TEXT_SIZE_FACTOR,
                        filterQuality: FilterQuality.none,
                        fit: BoxFit.fitHeight,
                      ),
                    ),
                    TextSpan(
                      text: '${message.sender}: ',
                      style: TextStyle(
                        fontFamily: CHAT_FONT_FAMILY,
                        fontSize: baseSize * CHAT_MESSAGE_TEXT_SIZE_FACTOR,
                        color: isSelfSent ? CHAT_SELF_SENDER_COLOR : CHAT_OTHER_SENDER_COLOR,
                        shadows: [
                          Shadow(offset: Offset(baseSize * CHAT_MESSAGE_TEXT_SHADOW_OFFSET_FACTOR, 0), color: CHAT_TEXT_SHADOW_COLOR, blurRadius: 0),
                        ],
                      ),
                    ),
                    TextSpan(
                      text: message.content,
                      style: TextStyle(
                        fontFamily: CHAT_FONT_FAMILY,
                        fontSize: baseSize * CHAT_MESSAGE_TEXT_SIZE_FACTOR,
                        color: CHAT_MESSAGE_COLOR,
                        shadows: [
                          Shadow(offset: Offset(baseSize * CHAT_MESSAGE_TEXT_SHADOW_OFFSET_FACTOR, 0), color: CHAT_TEXT_SHADOW_COLOR, blurRadius: 0),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class ChatInputBar extends StatelessWidget {
  const ChatInputBar({super.key, required this.baseSize, required this.messageController, required this.focusNode, required this.onSend});

  final double baseSize;
  final TextEditingController messageController;
  final FocusNode focusNode;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: baseSize * CHAT_INPUT_HEIGHT_FACTOR,
      width: double.infinity,
      color: CHAT_INPUT_BACKGROUND_COLOR,
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: messageController,
              focusNode: focusNode,
              textAlignVertical: TextAlignVertical.center,
              style: TextStyle(
                fontFamily: CHAT_FONT_FAMILY,
                fontSize: baseSize * CHAT_INPUT_TEXT_SIZE_FACTOR,
                color: CHAT_MESSAGE_COLOR,
                shadows: [
                  Shadow(offset: Offset(baseSize * CHAT_INPUT_TEXT_SHADOW_OFFSET_FACTOR, 0), color: CHAT_INPUT_TEXT_SHADOW_COLOR, blurRadius: 0),
                ],
              ),
              decoration: InputDecoration(
                hintText: I18nService().translate(CHAT_INPUT_HINT_KEY),
                hintStyle: TextStyle(
                  fontFamily: CHAT_FONT_FAMILY,
                  color: CHAT_HINT_COLOR,
                  shadows: const [Shadow(offset: Offset(0, 0))],
                  fontSize: baseSize * CHAT_INPUT_TEXT_SIZE_FACTOR,
                ),
                isCollapsed: true,
                border: InputBorder.none,
                contentPadding: EdgeInsets.only(left: baseSize * CHAT_INPUT_LEFT_PADDING_FACTOR),
              ),
              onSubmitted: (_) => onSend(),
            ),
          ),
          GestureDetector(
            onTap: () {
              onSend();
              AudioService().playSoundEffect(SoundEffect.Select.path);
            },
            child: Container(
              width: baseSize * CHAT_SEND_BUTTON_WIDTH_FACTOR,
              height: baseSize * CHAT_SEND_BUTTON_HEIGHT_FACTOR,
              color: CHAT_SEND_BUTTON_COLOR,
              child: Center(
                child: Text(
                  CHAT_SEND_LABEL,
                  style: TextStyle(
                    color: CHAT_SEND_TEXT_COLOR,
                    fontFamily: CHAT_FONT_FAMILY,
                    fontSize: baseSize * CHAT_SEND_BUTTON_TEXT_SIZE_FACTOR,
                    height: baseSize * CHAT_SEND_BUTTON_TEXT_HEIGHT_FACTOR,
                    shadows: [
                      Shadow(offset: Offset(baseSize * CHAT_SEND_BUTTON_SHADOW_OFFSET_FACTOR, 0), color: CHAT_INPUT_TEXT_SHADOW_COLOR, blurRadius: 0),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ChatExpandedContent extends StatelessWidget {
  const ChatExpandedContent({
    super.key,
    required this.baseSize,
    required this.messages,
    required this.scrollController,
    required this.messageController,
    required this.focusNode,
    required this.onSend,
    required this.selectedChannel,
    required this.onChannelChanged,
    required this.showMatchChannel,
  });

  final double baseSize;
  final List<ChatMessage> messages;
  final ScrollController scrollController;
  final TextEditingController messageController;
  final FocusNode focusNode;
  final VoidCallback onSend;
  final ChatChannel selectedChannel;
  final ValueChanged<ChatChannel> onChannelChanged;
  final bool showMatchChannel;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ChatHeader(baseSize: baseSize, selectedChannel: selectedChannel, onChannelChanged: onChannelChanged, showMatchChannel: showMatchChannel),
        ChatMessagesList(baseSize: baseSize, messages: messages, scrollController: scrollController),
        ChatInputBar(baseSize: baseSize, messageController: messageController, focusNode: focusNode, onSend: onSend),
      ],
    );
  }
}

class ChatCollapsedCenterIcon extends StatelessWidget {
  const ChatCollapsedCenterIcon({super.key, required this.baseSize});

  final double baseSize;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Image.asset(
        CHAT_MAIL_ICON_ASSET,
        width: baseSize * CHAT_COLLAPSED_MAIL_ICON_SIZE_FACTOR,
        height: baseSize * CHAT_COLLAPSED_MAIL_ICON_SIZE_FACTOR,
        filterQuality: FilterQuality.none,
        fit: BoxFit.contain,
      ),
    );
  }
}

class ChatTopEdge extends StatelessWidget {
  const ChatTopEdge({
    super.key,
    required this.baseSize,
    required this.cornerSize,
    required this.innerWidth,
    required this.isCompact,
    required this.onTap,
  });

  final double baseSize;
  final double cornerSize;
  final double innerWidth;
  final bool isCompact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        onTap();
        AudioService().playSoundEffect(SoundEffect.Select.path);
      },
      child: Row(
        children: [
          Container(
            width: cornerSize,
            height: cornerSize,
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(CHAT_BORDER_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
            ),
          ),
          SizedBox(
            width: innerWidth,
            height: cornerSize,
            child: Stack(
              children: [
                Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(image: AssetImage(CHAT_EDGE_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Align(
                    alignment: Alignment.center,
                    child: Transform.rotate(
                      angle: 3.141592653589793 / 2,
                      child: Text(
                        isCompact ? '' : '>',
                        style: TextStyle(
                          color: CHAT_COLLAPSE_ICON_COLOR,
                          fontFamily: CHAT_FONT_FAMILY,
                          fontSize: baseSize * CHAT_COLLAPSE_TEXT_SIZE_FACTOR,
                          height: baseSize * CHAT_COLLAPSE_TEXT_HEIGHT_FACTOR,
                          shadows: [
                            Shadow(
                              offset: Offset(baseSize * CHAT_COLLAPSE_TEXT_SHADOW_OFFSET_FACTOR, 0),
                              color: CHAT_COLLAPSE_ICON_SHADOW_COLOR,
                              blurRadius: 0,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: cornerSize,
            height: cornerSize,
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(CHAT_BORDER_2_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
            ),
          ),
        ],
      ),
    );
  }
}

class ChatBottomEdge extends StatelessWidget {
  const ChatBottomEdge({super.key, required this.cornerSize, required this.innerWidth});

  final double cornerSize;
  final double innerWidth;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Transform.rotate(
          angle: 3.141592653589793,
          child: Container(
            width: cornerSize,
            height: cornerSize,
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(CHAT_BORDER_2_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
            ),
          ),
        ),
        SizedBox(
          width: innerWidth,
          height: cornerSize,
          child: Transform.rotate(
            angle: 3.141592653589793,
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(image: AssetImage(CHAT_EDGE_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
            ),
          ),
        ),
        Transform.rotate(
          angle: 3.141592653589793,
          child: Container(
            width: cornerSize,
            height: cornerSize,
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(CHAT_BORDER_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
            ),
          ),
        ),
      ],
    );
  }
}

class ChatMiddleSection extends StatelessWidget {
  const ChatMiddleSection({
    super.key,
    required this.cornerSize,
    required this.sideEdgeWidth,
    required this.inset,
    required this.middleHeight,
    required this.animDuration,
    required this.animCurve,
    required this.isCompact,
    required this.expandedChild,
  });

  final double cornerSize;
  final double sideEdgeWidth;
  final double inset;
  final double middleHeight;
  final Duration animDuration;
  final Curve animCurve;
  final bool isCompact;
  final Widget expandedChild;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: middleHeight,
      child: ClipRect(
        child: Stack(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: SizedBox(
                width: sideEdgeWidth,
                child: Transform.rotate(
                  angle: 3.141592653589793,
                  child: Container(
                    decoration: const BoxDecoration(
                      image: DecorationImage(image: AssetImage(CHAT_EDGE_2_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                    ),
                  ),
                ),
              ),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: SizedBox(
                width: sideEdgeWidth,
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(image: AssetImage(CHAT_EDGE_2_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  ),
                ),
              ),
            ),
            Positioned.fill(
              left: inset,
              right: inset,
              child: CustomPaint(
                painter: StripePainter(
                  stripeSize: cornerSize * CHAT_CENTER_STRIPE_SIZE_FACTOR,
                  color1: CHAT_CENTER_STRIPE_COLOR_1,
                  color2: CHAT_CENTER_STRIPE_COLOR_2,
                ),
                child: AnimatedSwitcher(
                  duration: animDuration,
                  switchInCurve: animCurve,
                  switchOutCurve: animCurve,
                  child: isCompact
                      ? const SizedBox.expand(key: ValueKey('collapsed_center'))
                      : Container(key: const ValueKey('expanded_center'), child: expandedChild),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
