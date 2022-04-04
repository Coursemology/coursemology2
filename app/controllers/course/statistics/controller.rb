# frozen_string_literal: true
class Course::Statistics::Controller < Course::ComponentController
  before_action :authorize_read_statistics!

  private

  def authorize_read_statistics!
    authorize!(:read_statistics, current_course)
  end

  # @return [Course::StatisticsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_statistics_component]
  end
end
