# frozen_string_literal: true
class Course::ExperiencePointsRecordsController < Course::ComponentController
  include Course::UsersBreadcrumbConcern

  load_resource :course_user, through: :course, id_param: :user_id
  load_and_authorize_resource :experience_points_record, through: :course_user,
                                                         class: Course::ExperiencePointsRecord.name
  before_action :add_breadcrumbs

  def index
    respond_to do |format|
      format.html
      format.json do
        updater_ids = @experience_points_records.active.pluck(:updater_id)
        @course_user_preload_service =
          Course::CourseUserPreloadService.new(updater_ids, current_course)
        @experience_points_records =
          @experience_points_records.active.
          preload([{ actable: [:assessment, :survey] }, :updater]).order(updated_at: :desc)
        @experience_points_count = @experience_points_records.count
        @experience_points_records = @experience_points_records.paginated(new_page_params)
      end
    end
  end

  def update
    if @experience_points_record.update(experience_points_record_params)
      course_user = CourseUser.find_by(course: current_course, id: @experience_points_record.updater)
      updater_user = course_user || @experience_points_record.updater

      render json: { id: @experience_points_record.id,
                     reason: { text: @experience_points_record.reason },
                     pointsAwarded: @experience_points_record.points_awarded,
                     updatedAt: @experience_points_record.updated_at,
                     updaterUser: { id: updater_user.id, name: updater_user.name,
                                    isCourseUser: course_user.present? } }, status: :ok
    else
      render json: { errors: @experience_points_record.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @experience_points_record.destroy
      head :ok
    else
      render json: { errors: @experience_points_record.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def experience_points_record_params
    params.require(:experience_points_record).permit(:points_awarded, :reason)
  end

  def add_breadcrumbs
    add_breadcrumb @course_user.name, course_user_path(current_course, @course_user)
    add_breadcrumb :index
  end

  # @return [Course::ExperiencePointsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_experience_points_component]
  end
end
