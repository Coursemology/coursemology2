class Course::Forum::Controller < Course::ComponentController
  before_action :load_forum
  authorize_resource :forum, class: Course::Forum.name
  before_action :check_component
  before_action :load_settings
  before_action :add_forum_breadcrumb

  private

  def load_forum
    @forum ||= current_course.forums.friendly.find(params[:forum_id])
  end

  # @return [Course::ForumsComponent|nil] The forum component or nil if disabled.
  def component
    current_component_host[:course_forums_component]
  end

  # Load current component's settings
  def load_settings
    @forum_settings = component.settings
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
end
