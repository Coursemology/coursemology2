# Image uploader for Achievement Badge
# This class contains achievement badge specific settings for the image uploader.
class AchievementBadgeUploader < ImageUploader
  # Returns the default achievement logo if achievement object does not have a badge, ie. nil
  # The logo returned will adhere to the version specified in the method call for badge.
  #
  # @return [String] A string representing the URL of the default logo.
  def default_url
    [version_name, 'achievement-blank.png'].compact.join('_')
  end
end
