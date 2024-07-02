# frozen_string_literal: true
class Course::Forum::Controller < Course::ComponentController
  helper Course::Forum::ControllerHelper
  before_action :load_forum, unless: :skip_load_forum?
  authorize_resource :forum, class: 'Course::Forum'

  private

  def load_forum
    @forum ||= current_course.forums.friendly.find(params[:forum_id] || params[:id])
  end

  # @return [Course::ForumsComponent] The forum component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_forums_component]
  end

  def skip_load_forum?
    false
  end
end
