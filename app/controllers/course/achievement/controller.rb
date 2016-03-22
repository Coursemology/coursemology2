# frozen_string_literal: true
class Course::Achievement::Controller < Course::ComponentController
  before_action :check_component
  load_and_authorize_resource :achievement, through: :course, class: Course::Achievement.name
  add_breadcrumb :index, :course_achievements_path

  helper name

  private

  # Ensure that the component is enabled.
  #
  # @raise [Coursemology::ComponentNotFoundError] When the component is disabled.
  def check_component
    raise ComponentNotFoundError unless component
  end

  # @return [Course::AchievementsComponent] The forum component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_achievements_component]
  end
end
