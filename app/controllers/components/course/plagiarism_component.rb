# frozen_string_literal: true
class Course::PlagiarismComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    return [] unless can?(:manage_plagiarism, current_course)

    [
      {
        key: :admin_plagiarism,
        icon: :plagiarism,
        type: :admin,
        weight: 3,
        path: course_plagiarism_assessments_path(current_course)
      }
    ]
  end
end
