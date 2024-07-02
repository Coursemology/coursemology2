# frozen_string_literal: true
class Course::Video::Controller < Course::ComponentController
  include Course::LessonPlan::ActsAsLessonPlanItemConcern

  load_and_authorize_resource :video, through: :course, class: 'Course::Video'

  private

  def current_tab
    raise NotImplementedError
  end

  # @return [Course::Video Component] The video component.
  # @return [nil] If video component is disabled.
  def component
    current_component_host[:course_videos_component]
  end
end
