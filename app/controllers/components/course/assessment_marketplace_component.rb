# frozen_string_literal: true
class Course::AssessmentMarketplaceComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    'Assessment Marketplace'
  end

  def sidebar_items
    return [] unless can?(:access_marketplace, current_course)

    [
      key: :admin_marketplace,
      icon: :duplication,
      type: :admin,
      weight: 6,
      path: course_marketplace_path(current_course)
    ]
  end
end
