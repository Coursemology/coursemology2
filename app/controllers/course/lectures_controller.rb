# frozen_string_literal: true
class Course::LecturesController < Course::ComponentController
  load_and_authorize_resource :lecture, through: :course, class: Course::Lecture.name
  before_action :add_lecture_breadcrumb

  def access_link #:nodoc:
    respond_to do |format|
      format.json do
        link, errors = @lecture.handle_access_link(current_user, can?(:manage, @lecture))
        if errors.present?
          render json: { errors: errors }, status: 400
        else
          render json: { link: link }
        end
      end
    end
  end

  def index #:nodoc:
    @lectures = @lectures.includes(:creator).sorted_by_date
    @lectures = @lectures.page(page_param)
  end

  def show; end #:nodoc:

  def new; end #:nodoc:

  def create #:nodoc:
    if @lecture.save
      redirect_to course_lectures_path(current_course),
                  success: t('.success', title: @lecture.title)
    else
      render 'new'
    end
  end

  def edit; end #:nodoc:

  def update #:nodoc:
    if @lecture.update_attributes(lecture_params)
      redirect_to course_lectures_path(current_course),
                  success: t('.success', title: @lecture.title)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @lecture.destroy
      redirect_to course_lectures_path(current_course),
                  success: t('.success', title: @lecture.title)
    else
      redirect_to course_lectures_path(current_course),
                  danger: t('.failure', error: @lecture.errors.full_messages.to_sentence)
    end
  end

  private

  def lecture_params #:nodoc:
    params.require(:lecture).permit(:title, :content, :start_at, :end_at)
  end

  def add_lecture_breadcrumb
    add_breadcrumb @settings.title || :index, :course_lectures_path
  end

  # @return [Course::LecturesComponent] The lecture component.
  # @return [nil] If lecture component is disabled.
  def component
    current_component_host[:course_lectures_component]
  end
end
