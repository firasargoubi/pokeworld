import 'dart:async';
import 'dart:math' as math;

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/chat_message.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';

import '../../services/chat_service/chat_service.dart';
import 'chat_const.dart';
import 'chat_widgets.dart';

class Chat extends StatefulWidget {
  const Chat({
    super.key,
    required this.baseSize,
    this.showMatchChannel = false,
    this.compactWidth = CHAT_DEFAULT_COMPACT_WIDTH,
    this.compactHeight = CHAT_DEFAULT_COMPACT_HEIGHT,
    this.animDuration = CHAT_DEFAULT_ANIM_DURATION,
    this.animCurve = CHAT_DEFAULT_ANIM_CURVE,
  });

  final double baseSize;
  final bool showMatchChannel;
  final double compactWidth;
  final double compactHeight;
  final Duration animDuration;
  final Curve animCurve;

  @override
  State<Chat> createState() => _ChatState();
}

class _ChatState extends State<Chat> {
  static bool _isCompact = true;
  static ChatChannel _selectedChannel = ChatChannel.General;

  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  final ChatService _chatService = ChatService();
  StreamSubscription<List<ChatMessage>>? _generalSubscription;
  StreamSubscription<List<ChatMessage>>? _matchSubscription;

  List<ChatMessage> _generalMessages = [];
  List<ChatMessage> _matchMessages = [];

  List<ChatMessage> get _currentMessages => _selectedChannel == ChatChannel.General ? _generalMessages : _matchMessages;

  void _toggleCompact() {
    setState(() => _isCompact = !_isCompact);
    AudioService().playSoundEffect(SoundEffect.Select.path);
  }

  double _lerp(double start, double end, double t) => start + (end - start) * t;

  @override
  void initState() {
    super.initState();

    _generalMessages = _chatService.allMessages;
    _matchMessages = _chatService.matchMessages;

    _generalSubscription = _chatService.generalMessagesStream.listen((messages) {
      setState(() => _generalMessages = messages);
      if (_selectedChannel == ChatChannel.General) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    });

    _matchSubscription = _chatService.matchMessagesStream.listen((messages) {
      setState(() => _matchMessages = messages);
      if (_selectedChannel == ChatChannel.Match) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  @override
  void dispose() {
    _generalSubscription?.cancel();
    _matchSubscription?.cancel();
    _scrollController.dispose();
    _messageController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    if (_selectedChannel == ChatChannel.General) {
      _chatService.sendGeneralMessage(text);
    } else {
      _chatService.sendMatchMessage(text);
    }

    _messageController.clear();
    _focusNode.requestFocus();
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = widget.baseSize;
    final cornerSize = baseSize * CHAT_CORNER_SIZE_FACTOR;
    final sideEdgeWidth = cornerSize * CHAT_SIDE_EDGE_WIDTH_FACTOR;

    return LayoutBuilder(
      builder: (context, constraints) {
        final normalInnerWidth = math.max(0.0, constraints.maxWidth - 2 * cornerSize);
        final normalMiddleHeight = math.max(0.0, constraints.maxHeight - 2 * cornerSize);

        final compactInnerWidth = widget.compactWidth.clamp(0.0, normalInnerWidth) * baseSize;
        final compactMiddleHeight = widget.compactHeight.clamp(0.0, normalMiddleHeight) * baseSize;

        return TweenAnimationBuilder<double>(
          duration: widget.animDuration,
          curve: widget.animCurve,
          tween: Tween<double>(end: _isCompact ? 1.0 : 0.0),
          builder: (context, t, _) {
            final innerWidth = _lerp(normalInnerWidth, compactInnerWidth, t);
            final middleHeight = _lerp(normalMiddleHeight, compactMiddleHeight, t);

            final totalWidth = innerWidth + 2 * cornerSize;
            final totalHeight = middleHeight + 2 * cornerSize;

            final inset = math.min(sideEdgeWidth, totalWidth / 2);

            return Align(
              alignment: Alignment.bottomLeft,
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _isCompact ? _toggleCompact : null,
                child: SizedBox(
                  width: totalWidth,
                  height: totalHeight,
                  child: Stack(
                    children: [
                      Column(
                        children: [
                          ChatTopEdge(
                            baseSize: baseSize,
                            cornerSize: cornerSize,
                            innerWidth: innerWidth,
                            isCompact: _isCompact,
                            onTap: _toggleCompact,
                          ),
                          ChatMiddleSection(
                            cornerSize: cornerSize,
                            sideEdgeWidth: sideEdgeWidth,
                            inset: inset,
                            middleHeight: middleHeight,
                            animDuration: widget.animDuration,
                            animCurve: widget.animCurve,
                            isCompact: _isCompact,
                            expandedChild: ChatExpandedContent(
                              baseSize: baseSize,
                              messages: _currentMessages,
                              scrollController: _scrollController,
                              messageController: _messageController,
                              focusNode: _focusNode,
                              onSend: _sendMessage,
                              selectedChannel: _selectedChannel,
                              showMatchChannel: widget.showMatchChannel,
                              onChannelChanged: (ch) {
                                setState(() => _selectedChannel = ch);
                                WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
                              },
                            ),
                          ),
                          ChatBottomEdge(cornerSize: cornerSize, innerWidth: innerWidth),
                        ],
                      ),
                      if (_isCompact) const Positioned.fill(child: IgnorePointer(child: ChatCollapsedCenterIcon(baseSize: 0))),
                      if (_isCompact)
                        Positioned.fill(
                          child: IgnorePointer(child: ChatCollapsedCenterIcon(baseSize: baseSize)),
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
