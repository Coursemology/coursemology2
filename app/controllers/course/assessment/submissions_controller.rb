# frozen_string_literal: true
class Course::Assessment::SubmissionsController < Course::ComponentController
  before_action :load_submissions
  before_action :add_submissions_breadcrumb

  def index #:nodoc:
    @submissions = @submissions.with_submission_statistics.page(page_param).
                   includes(:assessment, experience_points_record: { course_user: :course })
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
    @submissions = Course::Assessment::Submission.from_category(category).confirmed.
                   ordered_by_submitted_date.accessible_by(current_ability)
  end

  def add_submissions_breadcrumb
    add_breadcrumb :index, course_submissions_path(current_course, category: category)
  end
end
