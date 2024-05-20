# frozen_string_literal: true
class Course::Settings::VideosComponent < Course::Settings::Component
  include ActiveModel::Conversion
  include CourseConcern::Settings::LessonPlanSettingsConcern

  def self.component_class
    Course::VideosComponent
  end

  def lesson_plan_item_settings
    super.merge(component_title: I18n.t('course.video.videos.index.header'))
  end

  def showable_in_lesson_plan?
    settings.lesson_plan_items ? settings.lesson_plan_items['enabled'] : true
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
    title = nil if title.blank?
    settings.title = title
  end
end
