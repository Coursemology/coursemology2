# frozen_string_literal: true
class Course::Assessment::QuestionBundleAssignmentsController < Course::Assessment::Controller
  load_and_authorize_resource :question_bundle_assignment, class: Course::Assessment::QuestionBundleAssignment,
                                                           through: :assessment

  before_action :add_breadcrumbs

  def index
    @question_bundle_assignments = @question_bundle_assignments.order(:user_id, :submission_id, :bundle_id)
  end

  def new
  end

  def create
    if @question_bundle_assignment.save
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @question_bundle_assignment.update(question_bundle_assignment_params)
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
    else
      render 'edit'
    end
  end

  def destroy
    if @question_bundle_assignment.destroy
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment)
    else
      redirect_to course_assessment_question_bundle_assignments_path(current_course, @assessment),
                  danger: @question_bundle_assignment.errors.full_messages.to_sentence
    end
  end

  private

  def add_breadcrumbs
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
    add_breadcrumb('Question Bundle Assignment',
                   course_assessment_question_bundle_assignments_path(current_course, @assessment))
  end

  def question_bundle_assignment_params
    params.require(:question_bundle_assignment).permit(:user_id, :submission_id, :bundle_id)
  end
end
