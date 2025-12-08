# frozen_string_literal: true
class Course::MultipleReferenceTimelinesComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    return [] unless can?(:manage, Course::ReferenceTimeline.new(course: current_course))

    [
      {
        key: :admin_multiple_reference_timelines,
        icon: :timelines,
        type: :admin,
        weight: 9,
        path: course_reference_timelines_path(current_course)
      }
    ]
  end
end
