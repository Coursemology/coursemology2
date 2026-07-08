# frozen_string_literal: true
class Course::Assessment::Marketplace::Controller < Course::ComponentController
  private

  def component
    current_component_host[:course_assessment_marketplace_component]
  end
end
