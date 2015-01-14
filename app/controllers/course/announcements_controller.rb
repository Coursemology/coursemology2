class Course::AnnouncementsController < Course::ModuleController
  load_and_authorize_resource :announcement, through: :course, class: Course::Announcement.name

  def index #:nodoc:
  end

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def edit #:nodoc:
  end

  def create #:nodoc:
  end

  def update #:nodoc:
  end

  def destroy #:nodoc:
  end

  private

  def announcement_params #:nodoc:
    params.require(:course_announcement).permit(:title, :content, :valid_from, :valid_to)
  end
end
