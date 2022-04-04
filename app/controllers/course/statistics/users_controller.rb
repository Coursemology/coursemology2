# frozen_string_literal: true
class Course::Statistics::UsersController < Course::Statistics::Controller
  def learning_rate_records
    @course_user = CourseUser.find(params[:user_id])
    @learning_rate_records = @course_user.learning_rate_records
  end
end
