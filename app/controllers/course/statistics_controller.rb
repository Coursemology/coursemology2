# frozen_string_literal: true
class Course::StatisticsController < Course::ComponentController
  before_action :authorize_read_statistics!
  before_action :preload_levels, except: [:staff]

  def all_students
    all_students = course_users.students.ordered_by_experience_points.with_video_statistics
    @phantom_students, @students = all_students.partition(&:phantom?)
    @service = group_manager_preload_service
  end

  def all_students_download
    job = Course::StatisticsDownloadJob.perform_later(current_course, current_course_user,
                                                      can?(:analyze_videos, current_course)).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
    end
  end

  def my_students
    my_students = current_course_user.my_students.ordered_by_experience_points.with_video_statistics
    @phantom_students, @students = my_students.partition(&:phantom?)
    # We still need the service, as some of the user's students may have more than one tutor,
    # and we will need the preload service to identify all tutors of these students.
    @service = group_manager_preload_service
  end

  def my_students_download
    job = Course::StatisticsDownloadJob.perform_later(current_course, current_course_user,
                                                      can?(:analyze_videos, current_course), only_my_students: true).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
    end
  end

  def staff
    @staff = current_course.course_users.teaching_assistant_and_manager.includes(:group_users)
    @staff = CourseUser.order_by_average_marking_time(@staff)
  end

  private

  def authorize_read_statistics!
    authorize!(:read_statistics, current_course)
  end

  def course_users
    @course_users ||= current_course.course_users.includes(:groups)
  end

  def group_manager_preload_service
    staff = course_users.staff
    Course::GroupManagerPreloadService.new(staff)
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
