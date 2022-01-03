# frozen_string_literal: true
class Course::StatisticsController < Course::ComponentController
  before_action :authorize_read_statistics!

  def all_students
    preload_levels
    course_users = current_course.course_users.includes(:groups)
    staff = course_users.staff
    all_students = course_users.students.ordered_by_experience_points.with_video_statistics
    @phantom_students, @students = all_students.partition(&:phantom?)
    @service = Course::GroupManagerPreloadService.new(staff)
  end

  def all_students_download
    # TODO
  end

  def my_students
    preload_levels
    course_users = current_course.course_users.includes(:groups)
    staff = course_users.staff
    my_students = current_course_user.my_students.ordered_by_experience_points.with_video_statistics
    @phantom_students, @students = my_students.partition(&:phantom?)
    # We still need the service, as some of the user's students may have more than one tutor,
    # i.e. we will need the preload service to identify all tutors of these students.
    @service = Course::GroupManagerPreloadService.new(staff)
  end

  def my_students_download
    # TODO
  end

  def staff
    @staff = current_course.course_users.teaching_assistant_and_manager.includes(:group_users)
    @staff = CourseUser.order_by_average_marking_time(@staff)
  end

  private

  def authorize_read_statistics!
    authorize!(:read_statistics, current_course)
  end

  # Pre-loads course levels to avoid N+1 queries when course_user.level_numbers are displayed.
  def preload_levels
    current_course.levels.to_a
  end

  # @return [Course::StatisticsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_statistics_component]
  end
end
