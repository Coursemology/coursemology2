# frozen_string_literal: true
class Course::Assessment::SubmissionsController < Course::ComponentController
  include Signals::EmissionConcern

  before_action :load_submissions
  before_action :load_category
  before_action :load_group_managers, only: [:index, :pending]

  signals :assessment_submissions, after: [:index, :pending]

  def index
    respond_to do |format|
      format.json do
        @submissions = @submissions.from_category(category).confirmed
        @submissions = @submissions.filter_by_params(filter_params) unless filter_params.blank?
        @submission_count = @submissions.count
        @submissions = @submissions.paginated(page_param)
        load_assessments
      end
    end
  end

  def pending
    respond_to do |format|
      format.json do
        @submissions = pending_submissions.from_course(current_course)
        @submission_count = @submissions.count
        @submissions = @submissions.paginated(page_param)
        load_assessments
      end
    end
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

  alias_method :load_category, :category

  # Load student submissions.
  def load_submissions
    student_ids = if current_course_user&.student?
                    current_user.id
                  else
                    @course.course_users.students.pluck(:user_id)
                  end

    @submissions = Course::Assessment::Submission.by_users(student_ids).
                   ordered_by_submitted_date.accessible_by(current_ability).
                   calculated(:grade).
                   includes(:answers, experience_points_record: { course_user: [:course, :groups] })
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

  # Load assessments hash
  def load_assessments
    ids = @submissions.map(&:assessment_id)
    @assessments = Course::Assessment.where(id: ids).calculated(:maximum_grade)
    @assessments_hash = @assessments.to_h do |assessment|
      [assessment.id, assessment]
    end
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
