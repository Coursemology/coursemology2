# frozen_string_literal: true
class Course::SimilarityComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.similarity.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    return [] unless can?(:manage_similarity, current_course)

    [
      {
        key: :similarity,
        icon: :similarity,
        title: t('course.similarity.header'),
        type: :admin,
        weight: 3,
        path: course_similarity_assessments_path(current_course)
      }
    ]
  end
end
