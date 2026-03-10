import 'dart:convert';

import 'package:flutter/material.dart';

const String _defaultProfileImagePath = 'assets/images/menu/pokemons/chibi/pikachu.png';

final Map<String, ImageProvider> _providerCache = {};

ImageProvider profilePictureImageProvider(String? profilePicture, {ImageProvider? fallback}) {
  final key = profilePicture ?? '';

  final cached = _providerCache[key];
  if (cached != null) return cached;

  ImageProvider provider;

  if (profilePicture == null || profilePicture.isEmpty) {
    provider = fallback ?? const AssetImage(_defaultProfileImagePath);
  } else if (profilePicture.startsWith('data:image')) {
    final commaIndex = profilePicture.indexOf(',');
    if (commaIndex == -1 || commaIndex >= profilePicture.length - 1) {
      provider = fallback ?? const AssetImage(_defaultProfileImagePath);
    } else {
      try {
        final bytes = base64Decode(profilePicture.substring(commaIndex + 1));
        provider = MemoryImage(bytes);
      } catch (_) {
        provider = fallback ?? const AssetImage(_defaultProfileImagePath);
      }
    }
  } else {
    provider = NetworkImage(profilePicture);
  }

  _providerCache[key] = provider;
  return provider;
}
