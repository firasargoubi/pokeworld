import 'dart:async';
import 'dart:math' as math;

import 'package:client_mobile/widgets/stripe_painter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../services/chat_service.dart';
import '../services/user_service.dart';
import '../utils/profile_image_provider.dart';
import '../utils/time_utils.dart';

class Chat extends StatefulWidget {
  final double baseSize;

  final double compactWidth;
  final double compactHeight;

  final Duration animDuration;
  final Curve animCurve;

  const Chat({
    super.key,
    required this.baseSize,
    this.compactWidth = 0.2,
    this.compactHeight = 0.2,
    this.animDuration = const Duration(milliseconds: 220),
    this.animCurve = Curves.easeInOut,
  });

  @override
  State<Chat> createState() => _ChatState();
}

class _ChatState extends State<Chat> {
  bool _isCompact = true;

  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  final ChatService _chatService = ChatService();
  StreamSubscription<List<ChatMessage>>? _sub;

  List<ChatMessage> _messages = [];

  void _toggleCompact() => setState(() => _isCompact = !_isCompact);

  double _lerp(double a, double b, double t) => a + (b - a) * t;

  @override
  void initState() {
    super.initState();

    _messages = _chatService.allMessages;

    _sub = _chatService.generalMessagesStream.listen((messages) {
      setState(() => _messages = messages);
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  @override
  void dispose() {
    _sub?.cancel();
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

    _chatService.sendGeneralMessage(text);
    _messageController.clear();
    _focusNode.requestFocus();

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  Widget _buildExpandedChildrenOnly(double cornerSize, double baseSize) {
    final messages = _messages;

    return Column(
      children: [
        Container(
          height: baseSize * 0.6,
          width: double.infinity,
          color: const Color(0xFF68a0d8),
          padding: EdgeInsets.symmetric(horizontal: baseSize * 0.1),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                width: baseSize * 1.5,
                height: baseSize * 0.5,
                padding: EdgeInsets.only(left: baseSize * 0.1, top: baseSize * 0.05),
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage('assets/images/menu/containers/chat/canal.png'),
                    fit: BoxFit.fitWidth,
                    alignment: Alignment.topCenter,
                    filterQuality: FilterQuality.none,
                    colorFilter: ColorFilter.mode(Color.fromARGB(255, 255, 200, 0), BlendMode.srcIn),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: baseSize * 0.3,
                      height: baseSize * 0.3,
                      child: Padding(
                        padding: EdgeInsets.all(baseSize * 0.04),
                        child: SvgPicture.asset(
                          'assets/images/menu/icons/chat/messages.svg',
                          fit: BoxFit.contain,
                          colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                        ),
                      ),
                    ),
                    SizedBox(width: baseSize * 0.07),
                    Text(
                      'Géneral',
                      style: TextStyle(color: Colors.white, fontFamily: 'Pixel', fontSize: baseSize * 0.3, height: baseSize * 0.008),
                    ),
                  ],
                ),
              ),
              SizedBox(width: baseSize * 0.1),
              Container(
                width: baseSize * 1.5,
                height: baseSize * 0.4,
                padding: EdgeInsets.only(left: baseSize * 0.1, top: baseSize * 0.05),
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage('assets/images/menu/containers/chat/canal.png'),
                    fit: BoxFit.fitWidth,
                    alignment: Alignment.topCenter,
                    filterQuality: FilterQuality.none,
                    colorFilter: ColorFilter.mode(Color(0xFFc0d0e0), BlendMode.srcIn),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: baseSize * 0.3,
                      height: baseSize * 0.3,
                      child: Padding(
                        padding: EdgeInsets.all(baseSize * 0.04),
                        child: SvgPicture.asset(
                          'assets/images/menu/icons/chat/messages.svg',
                          fit: BoxFit.contain,
                          colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                        ),
                      ),
                    ),
                    SizedBox(width: baseSize * 0.07),
                    Text(
                      'Partie',
                      style: TextStyle(color: Colors.white, fontFamily: 'Pixel', fontSize: baseSize * 0.3, height: baseSize * 0.008),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              final isSelfSent = msg.sender == UserService().currentUser.value?.username;
              final avatarImage = msg.profilePicture.isNotEmpty ? avatarImageProviderFromProfilePicture(msg.profilePicture) : null;

              return Padding(
                padding: EdgeInsets.all(baseSize * 0.02),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '[${formatTime(msg.timestamp.toLocal())}] ',
                          style: TextStyle(
                            fontFamily: 'Pixel',
                            fontSize: baseSize * 0.25,
                            height: baseSize * 0.007,
                            color: const Color(0xFF68a0d8),
                            shadows: [Shadow(offset: Offset(baseSize * 0.015, 0), color: const Color(0xFF787878), blurRadius: 0)],
                          ),
                        ),
                        if (avatarImage != null)
                          WidgetSpan(
                            alignment: PlaceholderAlignment.baseline,
                            baseline: TextBaseline.alphabetic,
                            child: Transform.translate(
                              offset: Offset(0, -baseSize * 0.02),
                              child: Padding(
                                padding: EdgeInsets.symmetric(horizontal: baseSize * 0.04),
                                child: CircleAvatar(radius: baseSize * 0.1, backgroundImage: avatarImage),
                              ),
                            ),
                          ),
                        TextSpan(
                          text: '${msg.sender}: ',
                          style: TextStyle(
                            fontFamily: 'Pixel',
                            fontSize: baseSize * 0.25,
                            height: baseSize * 0.007,
                            color: isSelfSent ? const Color.fromARGB(255, 170, 0, 255) : const Color(0xFFffa70f),
                            shadows: [Shadow(offset: Offset(baseSize * 0.015, 0), color: const Color(0xFF787878), blurRadius: 0)],
                          ),
                        ),
                        TextSpan(
                          text: msg.content,
                          style: TextStyle(
                            fontFamily: 'Pixel',
                            fontSize: baseSize * 0.25,
                            height: baseSize * 0.007,
                            color: const Color.fromARGB(255, 55, 55, 55),
                            shadows: [Shadow(offset: Offset(baseSize * 0.015, 0), color: const Color(0xFF787878), blurRadius: 0)],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Container(
          height: baseSize * 0.6,
          width: double.infinity,
          color: const Color(0xFF80b8e0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  focusNode: _focusNode,
                  style: TextStyle(
                    fontFamily: 'Pixel',
                    fontSize: baseSize * 0.3,
                    color: const Color.fromARGB(255, 55, 55, 55),
                    shadows: [Shadow(offset: Offset(baseSize * 0.015, 0), color: const Color.fromARGB(255, 66, 66, 66), blurRadius: 0)],
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Entrez votre message...',
                    hintStyle: TextStyle(
                      fontFamily: 'Pixel',
                      color: Color(0xFF787878),
                      shadows: [Shadow(offset: Offset(0, 0))],
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12.0),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              SizedBox(width: baseSize * 0.0),
              GestureDetector(
                onTap: _sendMessage,
                child: Container(
                  width: baseSize * 0.6,
                  height: baseSize * 0.6,
                  color: Colors.blue,
                  child: Center(
                    child: Text(
                      '>',
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: 'Pixel',
                        fontSize: baseSize * 0.45,
                        height: baseSize * 0.005,
                        shadows: [Shadow(offset: Offset(baseSize * 0.02, 0), color: const Color.fromARGB(255, 66, 66, 66), blurRadius: 0)],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = widget.baseSize;
    final cornerSize = baseSize * 0.5;
    final sideEdgeWidth = cornerSize * 0.37;

    return LayoutBuilder(
      builder: (context, constraints) {
        final normalInnerW = math.max(0.0, constraints.maxWidth - 2 * cornerSize);
        final normalMiddleH = math.max(0.0, constraints.maxHeight - 2 * cornerSize);

        final compactInnerW = widget.compactWidth.clamp(0.0, normalInnerW) * baseSize;
        final compactMiddleH = widget.compactHeight.clamp(0.0, normalMiddleH) * baseSize;

        return TweenAnimationBuilder<double>(
          duration: widget.animDuration,
          curve: widget.animCurve,
          tween: Tween<double>(end: _isCompact ? 1.0 : 0.0),
          builder: (context, t, _) {
            final innerW = _lerp(normalInnerW, compactInnerW, t);
            final middleH = _lerp(normalMiddleH, compactMiddleH, t);

            final totalW = innerW + 2 * cornerSize;
            final totalH = middleH + 2 * cornerSize;

            final inset = math.min(sideEdgeWidth, totalW / 2);

            return Align(
              alignment: Alignment.bottomLeft,
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _isCompact ? _toggleCompact : null,
                child: SizedBox(
                  width: totalW,
                  height: totalH,
                  child: Stack(
                    children: [
                      Column(
                        children: [
                          GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: _toggleCompact,
                            child: Row(
                              children: [
                                Container(
                                  width: cornerSize,
                                  height: cornerSize,
                                  decoration: const BoxDecoration(
                                    image: DecorationImage(
                                      image: AssetImage('assets/images/menu/containers/chat/chat-border.png'),
                                      fit: BoxFit.cover,
                                      filterQuality: FilterQuality.none,
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  width: innerW,
                                  height: cornerSize,
                                  child: Stack(
                                    children: [
                                      Container(
                                        decoration: const BoxDecoration(
                                          image: DecorationImage(
                                            image: AssetImage('assets/images/menu/containers/chat/chat-edge.png'),
                                            fit: BoxFit.fill,
                                            filterQuality: FilterQuality.none,
                                          ),
                                        ),
                                      ),
                                      Positioned(
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        child: Align(
                                          alignment: Alignment.center,
                                          child: Transform.rotate(
                                            angle: math.pi / 2,
                                            child: Text(
                                              _isCompact ? '' : '>',
                                              style: TextStyle(
                                                color: const Color(0xFF373737),
                                                fontFamily: 'Pixel',
                                                fontSize: baseSize * 0.45,
                                                height: baseSize * 0.005,
                                                shadows: [Shadow(offset: Offset(baseSize * -0.02, 0), color: const Color(0xFF9F9F9F), blurRadius: 0)],
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
                                    image: DecorationImage(
                                      image: AssetImage('assets/images/menu/containers/chat/chat-border-2.png'),
                                      fit: BoxFit.cover,
                                      filterQuality: FilterQuality.none,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: middleH,
                            child: ClipRect(
                              child: Stack(
                                children: [
                                  Align(
                                    alignment: Alignment.centerLeft,
                                    child: SizedBox(
                                      width: sideEdgeWidth,
                                      child: Transform.rotate(
                                        angle: math.pi,
                                        child: Container(
                                          decoration: const BoxDecoration(
                                            image: DecorationImage(
                                              image: AssetImage('assets/images/menu/containers/chat/chat-edge-2.png'),
                                              fit: BoxFit.fill,
                                              filterQuality: FilterQuality.none,
                                            ),
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
                                          image: DecorationImage(
                                            image: AssetImage('assets/images/menu/containers/chat/chat-edge-2.png'),
                                            fit: BoxFit.fill,
                                            filterQuality: FilterQuality.none,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Positioned.fill(
                                    left: inset,
                                    right: inset,
                                    child: CustomPaint(
                                      painter: StripePainter(
                                        stripeSize: cornerSize * 0.17,
                                        color1: const Color(0xFFe0f0f0),
                                        color2: const Color(0xFFf8f8f8),
                                      ),
                                      child: AnimatedSwitcher(
                                        duration: widget.animDuration,
                                        switchInCurve: widget.animCurve,
                                        switchOutCurve: widget.animCurve,
                                        child: _isCompact
                                            ? const SizedBox.expand(key: ValueKey('collapsed_center'))
                                            : Container(
                                                key: const ValueKey('expanded_center'),
                                                child: _buildExpandedChildrenOnly(cornerSize, baseSize),
                                              ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Row(
                            children: [
                              Transform.rotate(
                                angle: math.pi,
                                child: Container(
                                  width: cornerSize,
                                  height: cornerSize,
                                  decoration: const BoxDecoration(
                                    image: DecorationImage(
                                      image: AssetImage('assets/images/menu/containers/chat/chat-border-2.png'),
                                      fit: BoxFit.cover,
                                      filterQuality: FilterQuality.none,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: innerW,
                                height: cornerSize,
                                child: Transform.rotate(
                                  angle: math.pi,
                                  child: Container(
                                    decoration: const BoxDecoration(
                                      image: DecorationImage(
                                        image: AssetImage('assets/images/menu/containers/chat/chat-edge.png'),
                                        fit: BoxFit.fill,
                                        filterQuality: FilterQuality.none,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Transform.rotate(
                                angle: math.pi,
                                child: Container(
                                  width: cornerSize,
                                  height: cornerSize,
                                  decoration: const BoxDecoration(
                                    image: DecorationImage(
                                      image: AssetImage('assets/images/menu/containers/chat/chat-border.png'),
                                      fit: BoxFit.cover,
                                      filterQuality: FilterQuality.none,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      if (_isCompact)
                        Positioned.fill(
                          child: IgnorePointer(
                            child: Center(
                              child: Image.asset(
                                'assets/images/menu/icons/chat/mail.png',
                                width: baseSize * 0.35,
                                height: baseSize * 0.35,
                                filterQuality: FilterQuality.none,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
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
