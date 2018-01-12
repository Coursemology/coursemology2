# frozen_string_literal: true
class Course::Settings::VideosComponent < Course::Settings::Component
  include ActiveModel::Conversion
  include Course::Settings::EmailSettingsConcern
  include Course::Settings::LessonPlanSettingsConcern

  def self.email_setting_items
    {
      video_opening: { enabled_by_default: true },
      video_closing: { enabled_by_default: true }
    }
  end

  def self.component_class
    Course::VideosComponent
  end

  def lesson_plan_item_settings
    super.merge(component_title: I18n.t('course.video.videos.index.header'))
  end

  # Returns the title of video component
  #
  # @return [String] The custom or default title of video component
  def title
    settings.title
  end

  # Sets the title of video component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil unless title.present?
    settings.title = title
  end
end
