# frozen_string_literal: true
class Course::Assessment::SubmissionsController < Course::ComponentController
  before_action :load_submissions
  before_action :add_submissions_breadcrumb

  def index #:nodoc:
    @submissions = @submissions.from_category(category).confirmed
  end

  def pending
    @submissions = pending_submissions.from_course(current_course).with_submitted_state
  end

  private

  def submission_params
    params.permit(:category)
  end

  def pending_submission_params
    params.permit(:my_students)
  end

  # Load the current category, used to classify and load assessments.
  def category
    @category ||=
      if submission_params[:category]
        current_course.assessment_categories.find(submission_params[:category])
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
                            experience_points_record: { course_user: :course })
  end

  # Load pending submissions, either for the entire course, or for my students only.
  def pending_submissions
    if pending_submission_params[:my_students] == 'true'
      my_student_ids = current_course_user ? current_course_user.my_students.select(:user_id) : []
      @submissions.by_users(my_student_ids)
    else
      @submissions
    end
  end

  def add_submissions_breadcrumb
    add_breadcrumb :index, course_submissions_path(current_course, category: category)
  end
end
