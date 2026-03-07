import 'dart:convert';

import 'package:flutter/material.dart';

const String _defaultProfileImagePath = 'assets/images/menu/pokemons/chibi/pikachu.png';

ImageProvider avatarImageProviderFromProfilePicture(String? profilePicture, {ImageProvider? fallback}) {
  if (profilePicture == null || profilePicture.isEmpty) {
    return fallback ?? const AssetImage(_defaultProfileImagePath);
  }

  if (profilePicture.startsWith('data:image')) {
    final commaIndex = profilePicture.indexOf(',');
    if (commaIndex == -1 || commaIndex >= profilePicture.length - 1) {
      return fallback ?? const AssetImage(_defaultProfileImagePath);
    }

    try {
      final bytes = base64Decode(profilePicture.substring(commaIndex + 1));
      return MemoryImage(bytes);
    } catch (_) {
      return fallback ?? const AssetImage(_defaultProfileImagePath);
    }
  }

  return NetworkImage(profilePicture);
}
