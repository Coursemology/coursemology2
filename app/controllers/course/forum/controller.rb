class Course::Forum::Controller < Course::ComponentController
  before_action :load_forum
  authorize_resource :forum, class: Course::Forum.name
  before_action :check_component
  before_action :add_forum_breadcrumb

  private

  def load_forum
    @forum ||= current_course.forums.friendly.find(params[:forum_id])
  end

  # Ensure that the component is enabled.
  #
  # @raise [Coursemology::ComponentNotFoundError] When the component is disabled.
  def check_component
    fail ComponentNotFoundError unless component
  end

  def add_forum_breadcrumb
    add_breadcrumb component.settings.title || t('breadcrumbs.course.forum.forums.index'),
                   :course_forums_path
  end

  # @return [Course::ForumsComponent] The forum component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_forums_component]
  end
end
