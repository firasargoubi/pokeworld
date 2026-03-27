import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

class CameraService {
  static final CameraService _instance = CameraService._internal();

  factory CameraService() => _instance;

  CameraService._internal();

  ImagePicker? _imagePicker;

  ImagePicker get _imagePickerInstance {
    _imagePicker ??= ImagePicker();
    return _imagePicker!;
  }

  Future<XFile?> openCamera({double? maxWidth, double? maxHeight, int? imageQuality, CameraDevice preferredCameraDevice = CameraDevice.front}) async {
    try {
      final XFile? photo = await _imagePickerInstance.pickImage(
        source: ImageSource.camera,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageQuality: imageQuality,
        preferredCameraDevice: preferredCameraDevice,
      );
      return photo;
    } catch (error) {
      debugPrint('Camera open failed: $error');
      return null;
    }
  }
}
