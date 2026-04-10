enum TutorialMainTitle {
  Welcome('components.tutorial.welcome.title'),
  UserProfile('components.tutorial.userProfile.title'),
  Friends('components.tutorial.friends.title'),
  AppSettings('components.tutorial.appSettings.title'),
  Chat('components.tutorial.chat.title'),
  GameModes('components.tutorial.gameModes.title'),
  Shop('components.tutorial.shop.title'),
  GameCreation('components.tutorial.gameCreation.title');

  const TutorialMainTitle(this.label);
  final String label;
}

enum TutorialSubTitle {
  WelcomeFirst('components.tutorial.welcome.first.subTitleLabel'),
  UserProfileFirst('components.tutorial.userProfile.first.subTitleLabel'),
  UserProfileSecond('components.tutorial.userProfile.second.subTitleLabel'),
  UserProfileThird('components.tutorial.userProfile.third.subTitleLabel'),
  AppSettingsFirst('components.tutorial.appSettings.first.subTitleLabel'),
  FriendsFirst('components.tutorial.friends.first.subTitleLabel'),
  FriendsSecond('components.tutorial.friends.second.subTitleLabel'),
  FriendsThird('components.tutorial.friends.third.subTitleLabel'),
  FriendsFourth('components.tutorial.friends.fourth.subTitleLabel'),
  FriendsFifth('components.tutorial.friends.fifth.subTitleLabel'),
  FriendsSixth('components.tutorial.friends.sixth.subTitleLabel'),
  ChatFirst('components.tutorial.chat.first.subTitleLabel'),
  ChatSecond('components.tutorial.chat.second.subTitleLabel'),
  ChatThird('components.tutorial.chat.third.subTitleLabel'),
  ChatFourth('components.tutorial.chat.fourth.subTitleLabel'),
  GameModesFirst('components.tutorial.gameModes.first.subTitleLabel'),
  GameModesSecond('components.tutorial.gameModes.second.subTitleLabel'),
  GameModesThird('components.tutorial.gameModes.third.subTitleLabel'),
  ShopFirst('components.tutorial.shop.first.subTitleLabel'),
  ShopSecond('components.tutorial.shop.second.subTitleLabel'),
  ShopThird('components.tutorial.shop.third.subTitleLabel'),
  ShopFourth('components.tutorial.shop.fourth.subTitleLabel'),
  GameCreationFirst('components.tutorial.gameCreation.first.subTitleLabel'),
  GameCreationSecond('components.tutorial.gameCreation.second.subTitleLabel'),
  GameCreationThird('components.tutorial.gameCreation.third.subTitleLabel'),
  GameCreationFourth('components.tutorial.gameCreation.fourth.subTitleLabel'),
  GameCreationFifth('components.tutorial.gameCreation.fifth.subTitleLabel'),
  GameCreationSixth('components.tutorial.gameCreation.sixth.subTitleLabel'),
  GameCreationSeventh('components.tutorial.gameCreation.seventh.subTitleLabel'),
  GameCreationEighth('components.tutorial.gameCreation.eighth.subTitleLabel'),
  GameCreationNinth('components.tutorial.gameCreation.ninth.subTitleLabel');

  const TutorialSubTitle(this.label);
  final String label;
}

class TutorialStepDefinition {
  final TutorialMainTitle mainTitle;
  final TutorialSubTitle subTitle;
  final String imagePathFr;
  final String imagePathEn;
  final String description;
  final bool? displayProfessorLeft;
  final double? professorOffset;

  const TutorialStepDefinition({
    required this.mainTitle,
    required this.subTitle,
    required this.imagePathFr,
    required this.imagePathEn,
    required this.description,
    this.displayProfessorLeft,
    this.professorOffset,
  });
}

class TutorialStep {
  final TutorialMainTitle mainTitle;
  final TutorialSubTitle subTitle;
  final String imagePathFr;
  final String imagePathEn;
  final String description;
  final bool? displayProfessorLeft;
  final double? professorOffset;

  final int absoluteStepIndex;
  final int relativeStepIndex;
  final int mainTitleIndex;
  final int totalMainTitles;
  final int subTitleIndexInMainTitle;
  final int totalSubTitlesInMainTitle;

  const TutorialStep({
    required this.mainTitle,
    required this.subTitle,
    required this.imagePathFr,
    required this.imagePathEn,
    required this.description,
    required this.absoluteStepIndex,
    required this.relativeStepIndex,
    required this.mainTitleIndex,
    required this.totalMainTitles,
    required this.subTitleIndexInMainTitle,
    required this.totalSubTitlesInMainTitle,
    this.displayProfessorLeft,
    this.professorOffset,
  });

  String get mainTitleLabel => mainTitle.label;
  String get subTitleLabel => subTitle.label;

  String get mainProgressText => '$mainTitleIndex/$totalMainTitles';

  String get subProgressText => '$subTitleIndexInMainTitle/$totalSubTitlesInMainTitle';

  TutorialStep copyWith({
    TutorialMainTitle? mainTitle,
    TutorialSubTitle? subTitle,
    String? imagePathFr,
    String? imagePathEn,
    String? description,
    int? absoluteStepIndex,
    int? relativeStepIndex,
    int? mainTitleIndex,
    int? totalMainTitles,
    int? subTitleIndexInMainTitle,
    int? totalSubTitlesInMainTitle,
    bool? displayProfessorLeft,
    double? professorOffset,
  }) {
    return TutorialStep(
      mainTitle: mainTitle ?? this.mainTitle,
      subTitle: subTitle ?? this.subTitle,
      imagePathFr: imagePathFr ?? this.imagePathFr,
      imagePathEn: imagePathEn ?? this.imagePathEn,
      description: description ?? this.description,
      absoluteStepIndex: absoluteStepIndex ?? this.absoluteStepIndex,
      relativeStepIndex: relativeStepIndex ?? this.relativeStepIndex,
      mainTitleIndex: mainTitleIndex ?? this.mainTitleIndex,
      totalMainTitles: totalMainTitles ?? this.totalMainTitles,
      subTitleIndexInMainTitle: subTitleIndexInMainTitle ?? this.subTitleIndexInMainTitle,
      totalSubTitlesInMainTitle: totalSubTitlesInMainTitle ?? this.totalSubTitlesInMainTitle,
      displayProfessorLeft: displayProfessorLeft ?? this.displayProfessorLeft,
      professorOffset: professorOffset ?? this.professorOffset,
    );
  }
}

class TutorialCatalog {
  final List<TutorialStep> steps;

  const TutorialCatalog._(this.steps);

  factory TutorialCatalog.fromDefinitions(List<TutorialStepDefinition> definitions) {
    final orderedMainTitles = <TutorialMainTitle>[];
    final countsByMainTitle = <TutorialMainTitle, int>{};
    final relativeIndexByMainTitle = <TutorialMainTitle, int>{};

    for (final definition in definitions) {
      if (!orderedMainTitles.contains(definition.mainTitle)) {
        orderedMainTitles.add(definition.mainTitle);
      }

      countsByMainTitle.update(definition.mainTitle, (value) => value + 1, ifAbsent: () => 1);
    }

    final totalMainTitles = orderedMainTitles.length;
    final builtSteps = <TutorialStep>[];

    for (int i = 0; i < definitions.length; i++) {
      final definition = definitions[i];

      final nextRelativeIndex = (relativeIndexByMainTitle[definition.mainTitle] ?? 0) + 1;
      relativeIndexByMainTitle[definition.mainTitle] = nextRelativeIndex;

      final mainTitleIndex = orderedMainTitles.indexOf(definition.mainTitle) + 1;
      final totalSubTitlesInMainTitle = countsByMainTitle[definition.mainTitle]!;

      builtSteps.add(
        TutorialStep(
          mainTitle: definition.mainTitle,
          subTitle: definition.subTitle,
          imagePathFr: definition.imagePathFr,
          imagePathEn: definition.imagePathEn,
          description: definition.description,
          absoluteStepIndex: i,
          relativeStepIndex: nextRelativeIndex,
          mainTitleIndex: mainTitleIndex,
          totalMainTitles: totalMainTitles,
          subTitleIndexInMainTitle: nextRelativeIndex,
          totalSubTitlesInMainTitle: totalSubTitlesInMainTitle,
          displayProfessorLeft: definition.displayProfessorLeft,
          professorOffset: definition.professorOffset,
        ),
      );
    }

    return TutorialCatalog._(List.unmodifiable(builtSteps));
  }

  int get totalSteps => steps.length;

  int get totalMainTitles {
    if (steps.isEmpty) {
      return 0;
    }
    return steps.first.totalMainTitles;
  }

  List<TutorialMainTitle> get mainTitlesInOrder {
    final result = <TutorialMainTitle>[];
    final seen = <TutorialMainTitle>{};

    for (final step in steps) {
      if (seen.add(step.mainTitle)) {
        result.add(step.mainTitle);
      }
    }

    return result;
  }

  TutorialStep? getByAbsoluteStepIndex(int absoluteStepIndex) {
    if (absoluteStepIndex < 0 || absoluteStepIndex >= steps.length) {
      return null;
    }

    return steps[absoluteStepIndex];
  }

  List<TutorialStep> getStepsForMainTitle(TutorialMainTitle mainTitle) {
    return steps.where((step) => step.mainTitle == mainTitle).toList();
  }

  int? getMainTitleIndex(TutorialMainTitle mainTitle) {
    final index = mainTitlesInOrder.indexOf(mainTitle);
    if (index == -1) {
      return null;
    }
    return index + 1;
  }

  int getTotalStepsForMainTitle(TutorialMainTitle mainTitle) {
    return steps.where((step) => step.mainTitle == mainTitle).length;
  }

  TutorialStep? getFirstStepForMainTitle(TutorialMainTitle mainTitle) {
    for (final step in steps) {
      if (step.mainTitle == mainTitle) {
        return step;
      }
    }
    return null;
  }

  TutorialStep? getNextStep(int currentAbsoluteStepIndex) {
    final nextIndex = currentAbsoluteStepIndex + 1;
    return getByAbsoluteStepIndex(nextIndex);
  }

  TutorialStep? getPreviousStep(int currentAbsoluteStepIndex) {
    final previousIndex = currentAbsoluteStepIndex - 1;
    return getByAbsoluteStepIndex(previousIndex);
  }

  int? getSubTitleIndexInMainTitle(TutorialMainTitle mainTitle, TutorialSubTitle subTitle) {
    final stepsForMainTitle = getStepsForMainTitle(mainTitle);

    for (int i = 0; i < stepsForMainTitle.length; i++) {
      if (stepsForMainTitle[i].subTitle == subTitle) {
        return i + 1;
      }
    }

    return null;
  }

  int getTotalSubTitlesInMainTitle(TutorialMainTitle mainTitle) {
    return getTotalStepsForMainTitle(mainTitle);
  }
}
