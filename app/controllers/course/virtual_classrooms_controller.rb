# frozen_string_literal: true
class Course::VirtualClassroomsController < Course::ComponentController
  load_and_authorize_resource :virtual_classroom,
                              through: :course,
                              class: Course::VirtualClassroom.name
  before_action :add_virtual_classroom_breadcrumb

  def access_link #:nodoc:
    @braincert_api_service = Course::VirtualClassroom::BraincertApiService.new(
      @virtual_classroom, @settings
    )
    respond_to do |format|
      format.json do
        render_access_link
      end
    end
  end

  def index #:nodoc:
    @virtual_classrooms = @virtual_classrooms.includes(:creator).sorted_by_date.page(page_param)
  end

  def show; end #:nodoc:

  def new; end #:nodoc:

  def create #:nodoc:
    if @virtual_classroom.save
      redirect_to course_virtual_classrooms_path(current_course),
                  success: t('.success', title: @virtual_classroom.title)
    else
      render 'new'
    end
  end

  def edit; end #:nodoc:

  def update #:nodoc:
    if @virtual_classroom.update_attributes(virtual_classroom_params)
      redirect_to course_virtual_classrooms_path(current_course),
                  success: t('.success', title: @virtual_classroom.title)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @virtual_classroom.destroy
      redirect_to course_virtual_classrooms_path(current_course),
                  success: t('.success', title: @virtual_classroom.title)
    else
      redirect_to course_virtual_classrooms_path(current_course),
                  danger: t('.failure', error: @virtual_classroom.errors.full_messages.to_sentence)
    end
  end

  private

  def render_access_link
    link, errors = @braincert_api_service.handle_access_link(current_user,
                                                             can?(:manage, @virtual_classroom))
    if errors.present?
      render json: { errors: errors }, status: 400
    else
      render json: { link: link }
    end
  end

  def virtual_classroom_params #:nodoc:
    params.require(:virtual_classroom).permit(:title, :content, :start_at, :end_at)
  end

  def add_virtual_classroom_breadcrumb
    add_breadcrumb @settings.title || :index, :course_virtual_classrooms_path
  end

  # @return [Course::VirtualClassroomsComponent] The virtual classroom component.
  # @return [nil] If virtual classroom component is disabled.
  def component
    current_component_host[:course_virtual_classrooms_component]
  end
end
