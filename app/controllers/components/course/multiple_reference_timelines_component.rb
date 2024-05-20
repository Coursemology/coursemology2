# frozen_string_literal: true
class Course::MultipleReferenceTimelinesComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.multiple_reference_timelines.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    return [] unless can?(:manage, Course::ReferenceTimeline.new(course: current_course))

    [
      {
        key: :reference_timelines,
        icon: :timelines,
        type: :admin,
        weight: 9,
        title: t('layouts.multiple_reference_timelines.timeline_designer'),
        path: course_reference_timelines_path(current_course)
      }
    ]
  end
end
