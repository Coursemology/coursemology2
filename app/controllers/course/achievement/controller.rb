# frozen_string_literal: true
class Course::Achievement::Controller < Course::ComponentController
  load_and_authorize_resource :achievement, through: :course, class: Course::Achievement.name
  add_breadcrumb :index, :course_achievements_path

  helper name

  private

  # @return [Course::AchievementsComponent] The achievement component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_achievements_component]
  end
end
