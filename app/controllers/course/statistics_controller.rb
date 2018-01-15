# frozen_string_literal: true
class Course::StatisticsController < Course::ComponentController
  before_action :authorize_read_statistics!

  def student
    preload_levels
    course_users = current_course.course_users.includes(:groups)
    staff = course_users.staff
    all_students = course_users.students.ordered_by_experience_points
    @phantom_students, @students = all_students.partition(&:phantom?)
    @service = Course::GroupManagerPreloadService.new(staff)
  end

  def staff
    @staffs = current_course.course_users.teaching_assistant_and_manager
    @staffs = CourseUser.order_by_average_marking_time(@staffs)
  end

  private

  def authorize_read_statistics!
    authorize!(:read_statistics, current_course)
  end

  # Pre-loads course levels to avoid N+1 queries when course_user.level_numbers are displayed.
  def preload_levels
    current_course.levels.to_a
  end
end
