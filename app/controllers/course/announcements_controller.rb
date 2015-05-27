class Course::AnnouncementsController < Course::ComponentController
  load_and_authorize_resource :announcement, through: :course, class: Course::Announcement.name

  def index #:nodoc:
    @announcements = @announcements.includes(:creator).sorted_by_sticky.sorted_by_date
    @announcements = @announcements.page(params[:page])
    unread = @announcements.unread_by(current_user)
    Course::Announcement.mark_array_as_read(unread, current_user)
  end

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @announcement.save
      redirect_to(course_announcements_path(current_course),
                  success: t('.success', title: @announcement.title))
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @announcement.update_attributes(announcement_params)
      redirect_to(course_announcements_path(current_course),
                  success: t('.success', title: @announcement.title))
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    redirect_to(course_announcements_path(current_course),
                success: t('.success', title: @announcement.title)) if @announcement.destroy
  end

  private

  def announcement_params #:nodoc:
    params.require(:course_announcement).permit(:title, :content, :sticky, :valid_from, :valid_to)
  end
end
