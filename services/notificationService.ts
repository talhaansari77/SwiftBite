// Push notifications are disabled in Expo Go SDK 53
// They will work properly in the production APK build

export const registerForPushNotifications = async (): Promise<boolean> => {
  return false
}

export const sendLocalNotification = async (
  title: string,
  body: string
): Promise<void> => {
  // Will be implemented in production build
  console.log(`Notification: ${title} - ${body}`)
}