# frozen_string_literal: true
class Course::ExperiencePointsRecordsController < Course::ComponentController
  load_resource :course_user, through: :course
  load_and_authorize_resource :experience_points_record, through: :course_user,
                                                         class: Course::ExperiencePointsRecord.name

  def index # :nodoc:
    @experience_points_records =
      @experience_points_records.includes(creator: :course_users).references(:all)
  end

  def new # :nodoc:
  end

  def create # :nodoc:
    if @experience_points_record.save
      redirect_to course_course_user_experience_points_records_path(current_course, @course_user),
                  success: t('.success')
    else
      render 'new'
    end
  end

  private

  def experience_points_record_params # :nodoc:
    @experience_points_record_params ||=
      params.require(:experience_points_record).permit(:reason, :points_awarded)
  end
end
