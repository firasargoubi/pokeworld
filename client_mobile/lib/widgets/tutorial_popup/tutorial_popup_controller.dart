import 'package:client_mobile/consts/tutorial_catalog_const.dart';
import 'package:client_mobile/models/tutorial.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter/foundation.dart';

class TutorialPopupController extends ChangeNotifier {
  final UserService _userService = UserService();
  final tutorialCatalog = TutorialCatalog.fromDefinitions(TUTORIAL_STEPS);
  TutorialStep? get currentTutorialStep => tutorialCatalog.getByAbsoluteStepIndex(_userService.currentUser.value?.tutorialStep ?? 0);
  final int totalSteps = TUTORIAL_STEPS.length;

  bool get isFirstStep => (_userService.currentUser.value?.tutorialStep ?? 0) <= 0;
  bool get isLastStep => (_userService.currentUser.value?.tutorialStep ?? 0) >= totalSteps - 1;

  void init() {
    _userService.currentUser.addListener(_onUserChanged);
    final currentUser = _userService.currentUser.value;
    if (currentUser != null) {
      final currentStep = currentUser.tutorialStep;
      if (currentStep < 0 || currentStep >= totalSteps) {
        _userService.edit(userId: currentUser.userId, tutorialStep: 0);
      }
    }
  }

  void _onUserChanged() {
    notifyListeners();
  }

  void goToNextStep() {
    final currentStepIndex = _userService.currentUser.value?.tutorialStep ?? 0;
    if (currentStepIndex < totalSteps - 1) {
      _userService.edit(userId: UserService().currentUser.value!.userId, tutorialStep: currentStepIndex + 1);
    }
  }

  void goToPreviousStep() {
    final currentStepIndex = _userService.currentUser.value?.tutorialStep ?? 0;
    if (currentStepIndex > 0) {
      _userService.edit(userId: UserService().currentUser.value!.userId, tutorialStep: currentStepIndex - 1);
    }
  }

  void goToStep(int stepIndex) {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      _userService.edit(userId: UserService().currentUser.value!.userId, tutorialStep: stepIndex);
    }
  }

  @override
  void dispose() {
    _userService.currentUser.removeListener(_onUserChanged);
    super.dispose();
  }
}
