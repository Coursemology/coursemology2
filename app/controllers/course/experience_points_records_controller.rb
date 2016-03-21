# frozen_string_literal: true
class Course::ExperiencePointsRecordsController < Course::ComponentController
  load_resource :course_user, through: :course, id_param: :user_id
  load_and_authorize_resource :experience_points_record, through: :course_user,
                                                         class: Course::ExperiencePointsRecord.name

  def index # :nodoc:
    @experience_points_records =
      @experience_points_records.active.includes(creator: :course_users)
  end

  def destroy # :nodoc:
    if @experience_points_record.destroy
      destroy_success
    else
      destroy_failure
    end
  end

  private

  def destroy_success #:nodoc:
    redirect_to course_user_experience_points_records_path(current_course, @course_user),
                success: t('course.experience_points_records.destroy.success',
                           reason: @experience_points_record.reason)
  end

  def destroy_failure #:nodoc:
    redirect_to course_user_experience_points_records_path(current_course, @course_user),
                danger: @experience_points_record.errors.full_messages.to_sentence
  end
end
