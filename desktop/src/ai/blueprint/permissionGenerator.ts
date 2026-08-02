import type { AppPermission } from '../../blueprint/schema';

export function buildPermissions(features: string[]): AppPermission[] {
  const permissions: AppPermission[] = [
    { name: 'INTERNET', platform: 'android', reason: 'Required for API calls', required: true },
  ];

  if (features.some(f => ['gps_tracking', 'map', 'locationRequired', 'location'].includes(f))) {
    permissions.push({ name: 'ACCESS_FINE_LOCATION', platform: 'android', reason: 'GPS tracking feature', required: true });
    permissions.push({ name: 'ACCESS_COARSE_LOCATION', platform: 'android', reason: 'Approximate location', required: false });
    permissions.push({ name: 'NSLocationWhenInUseUsageDescription', platform: 'ios', reason: 'Location tracking for GPS features', required: true });
  }

  if (features.some(f => ['video', 'video_calls', 'teleconsult'].includes(f))) {
    permissions.push({ name: 'CAMERA', platform: 'android', reason: 'Video calling feature', required: true });
    permissions.push({ name: 'RECORD_AUDIO', platform: 'android', reason: 'Audio in video calls', required: true });
  }

  if (features.includes('notifications') || features.includes('notificationsRequired')) {
    permissions.push({ name: 'POST_NOTIFICATIONS', platform: 'android', reason: 'Push notifications', required: true });
    permissions.push({ name: 'NSUserNotificationUsageDescription', platform: 'ios', reason: 'Send push notifications', required: true });
  }

  if (features.some(f => ['files', 'file_sharing', 'image_picker'].includes(f))) {
    permissions.push({ name: 'READ_MEDIA_IMAGES', platform: 'android', reason: 'Image picker', required: true });
    permissions.push({ name: 'NSPhotoLibraryUsageDescription', platform: 'ios', reason: 'Access photo library', required: true });
  }

  return permissions;
}
