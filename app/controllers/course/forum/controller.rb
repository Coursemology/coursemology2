class Course::Forum::Controller < Course::ComponentController
  before_action :load_forum
  authorize_resource :forum, class: Course::Forum.name

  private

  def load_forum
    @forum ||= current_course.forums.friendly.find(params[:forum_id])
  end
end
