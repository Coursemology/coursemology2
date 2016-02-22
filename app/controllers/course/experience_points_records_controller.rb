# frozen_string_literal: true
class Course::ExperiencePointsRecordsController < Course::ComponentController
  load_resource :course_user, through: :course
  load_and_authorize_resource :experience_points_record, through: :course_user,
                                                         class: Course::ExperiencePointsRecord.name

  def index # :nodoc:
    @experience_points_records =
      @experience_points_records.active.includes(creator: :course_users)
  end
end
