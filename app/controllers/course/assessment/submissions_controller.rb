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

  # Load the current category, used to classify and load assessments.
  def category
    @category ||=
      if submission_params[:category]
        current_course.assessment_categories.find(submission_params[:category])
      else
        current_course.assessment_categories.first!
      end
  end

  # Load the submissions based on the current category.
  def load_submissions
    @submissions = Course::Assessment::Submission.
                   ordered_by_submitted_date.accessible_by(current_ability).page(page_param).
                   includes(:assessment, :answers,
                            experience_points_record: { course_user: :course })
  end

  # Load pending submissions based on current course role:
  #  Staff with students - show students in staff's groups with pending submissions
  #  Staff without students - show all students in course with pending submissions
  def pending_submissions
    my_student_ids = current_course_user ? current_course_user.my_students.pluck(:user_id) : []
    if !my_student_ids.empty?
      @submissions.by_users(my_student_ids)
    else
      @submissions
    end
  end

  def add_submissions_breadcrumb
    add_breadcrumb :index, course_submissions_path(current_course, category: category)
  end
end
