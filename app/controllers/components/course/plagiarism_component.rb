# frozen_string_literal: true
class Course::PlagiarismComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.plagiarism.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    return [] unless can?(:manage_plagiarism, current_course)

    [
      {
        key: :plagiarism,
        icon: :plagiarism,
        title: t('course.plagiarism.header'),
        type: :admin,
        weight: 3,
        path: course_plagiarism_assessments_path(current_course)
      }
    ]
  end
end
