# frozen_string_literal: true
# Bulk language upgrades are part of administering a course's programming assessments rather than a
# feature of their own, so this sits under the assessments component rather than carrying its own.
class Course::ProgrammingUpgrade::Controller < Course::ComponentController
  before_action :authorize_manage_programming_upgrades!

  private

  def authorize_manage_programming_upgrades!
    authorize!(:manage, :programming_upgrades)
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
