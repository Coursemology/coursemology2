# frozen_string_literal: true
class Course::ExperiencePointsRecordsController < Course::ComponentController
  include Course::UsersBreadcrumbConcern

  load_resource :course_user, through: :course, id_param: :user_id
  load_and_authorize_resource :experience_points_record, through: :course_user,
                                                         class: Course::ExperiencePointsRecord.name
  before_action :add_breadcrumbs

  def index # :nodoc:
    respond_to do |format|
      format.html
      format.json do
        updater_ids = @experience_points_records.active.pluck(:updater_id)
        @course_user_preload_service =
          Course::CourseUserPreloadService.new(updater_ids, current_course)
        @experience_points_records =
          @experience_points_records.active.
          includes(:actable, :updater).order(updated_at: :desc)
        @experience_points_count = @experience_points_records.count
        @experience_points_records = @experience_points_records.paginated(paginate_page_param)
      end
    end
  end

  def update
    if @experience_points_record.update(experience_points_record_params)
      flash.now[:success] = t('.success')
    else
      flash.now[:danger] = @experience_points_record.errors.full_messages.to_sentence
    end
  end

  def destroy
    if @experience_points_record.destroy
      destroy_success
    else
      destroy_failure
    end
  end

  private

  def experience_points_record_params
    params.require(:experience_points_record).permit(:points_awarded, :reason)
  end

  def destroy_success
    redirect_to course_user_experience_points_records_path(current_course, @course_user),
                success: t('course.experience_points_records.destroy.success')
  end

  def destroy_failure
    redirect_to course_user_experience_points_records_path(current_course, @course_user),
                danger: @experience_points_record.errors.full_messages.to_sentence
  end

  def add_breadcrumbs
    add_breadcrumb @course_user.name, course_user_path(current_course, @course_user)
    add_breadcrumb :index
  end

  def paginate_page_param
    params.permit(:page_num)
  end

  # @return [Course::ExperiencePointsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_experience_points_component]
  end
end
