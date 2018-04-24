# frozen_string_literal: true
class Course::Assessment::SubmissionsController < Course::ComponentController
  before_action :load_submissions
  before_action :add_submissions_breadcrumb
  before_action :load_group_managers, only: [:pending]

  def index #:nodoc:
    @submissions = @submissions.from_category(category).confirmed
    @submissions = @submissions.filter(filter_params) unless filter_params.blank?
  end

  def pending
    @submissions = pending_submissions.from_course(current_course)
  end

  private

  def submission_params
    params.permit(:category)
  end

  def pending_submission_params
    params.permit(:my_students)
  end

  def filter_params
    return {} if params[:filter].blank?
    params[:filter].permit(:assessment_id, :group_id, :user_id, :category_id)
  end

  def category_param
    submission_params[:category] || filter_params[:category_id]
  end

  # Load the current category, used to classify and load assessments.
  def category
    @category ||=
      if category_param
        current_course.assessment_categories.find(category_param)
      else
        current_course.assessment_categories.first!
      end
  end

  # Load student submissions.
  def load_submissions
    student_ids = @course.course_users.students.pluck(:user_id)
    @submissions = Course::Assessment::Submission.by_users(student_ids).
                   ordered_by_submitted_date.accessible_by(current_ability).page(page_param).
                   includes(:assessment, :answers,
                            experience_points_record: { course_user: [:course, :groups] })
  end

  # Load pending submissions, either for the entire course, or for my students only.
  def pending_submissions
    if pending_submission_params[:my_students] == 'true'
      my_student_ids = current_course_user ? current_course_user.my_students.select(:user_id) : []
      @submissions.by_users(my_student_ids).pending_for_grading
    else
      @submissions.pending_for_grading
    end
  end

  # Load group managers
  def load_group_managers
    course_staff = current_course.course_users.staff.includes(:groups)
    @service = Course::GroupManagerPreloadService.new(course_staff)
  end

  def add_submissions_breadcrumb
    add_breadcrumb :index, course_submissions_path(current_course, category: category)
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
