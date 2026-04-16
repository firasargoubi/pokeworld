import 'package:client_mobile/models/avatar_data.dart';
import 'package:client_mobile/models/shop.dart';

const Map<MenuMusicVariant, String> MUSIC_VARIANT_TO_IMAGE = {
  MenuMusicVariant.zero: 'assets/images/menu/shop-items/tm-0.png',
  MenuMusicVariant.one: 'assets/images/menu/shop-items/tm-1.png',
  MenuMusicVariant.two: 'assets/images/menu/shop-items/tm-2.png',
  MenuMusicVariant.three: 'assets/images/menu/shop-items/tm-3.png',
};

const Map<MenuMusicVariant, String> MUSIC_VARIANT_TO_DESCRIPTION = {
  MenuMusicVariant.zero: 'components.shopPopup.descriptions.menuMusic0',
  MenuMusicVariant.one: 'components.shopPopup.descriptions.menuMusic1',
  MenuMusicVariant.two: 'components.shopPopup.descriptions.menuMusic2',
  MenuMusicVariant.three: 'components.shopPopup.descriptions.menuMusic3',
};

const Map<PartyBallVariant, String> BALL_VARIANT_TO_DESCRIPTION = {
  PartyBallVariant.zero: 'components.shopPopup.descriptions.partyBall0',
  PartyBallVariant.one: 'components.shopPopup.descriptions.partyBall1',
  PartyBallVariant.two: 'components.shopPopup.descriptions.partyBall2',
  PartyBallVariant.three: 'components.shopPopup.descriptions.partyBall3',
  PartyBallVariant.four: 'components.shopPopup.descriptions.partyBall4',
};

const Map<Avatar, String> AVATAR_TO_DESCRIPTION = {
  Avatar.Avatar13: 'components.shopPopup.descriptions.avatar13',
  Avatar.Avatar14: 'components.shopPopup.descriptions.avatar14',
  Avatar.Avatar15: 'components.shopPopup.descriptions.avatar15',
};
