# frozen_string_literal: true
class Course::Assessment::QuestionBundlesController < Course::Assessment::Controller
  load_and_authorize_resource :question_bundle, class: Course::Assessment::QuestionBundle, through: :assessment
  before_action :add_breadcrumbs

  def index
  end

  def new
  end

  def create
    if @question_bundle.save
      redirect_to course_assessment_question_bundles_path(current_course, @assessment)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @question_bundle.update(question_bundle_params)
      redirect_to course_assessment_question_bundles_path(current_course, @assessment)
    else
      render 'edit'
    end
  end

  def destroy
    if @question_bundle.destroy
      redirect_to course_assessment_question_bundles_path(current_course, @assessment)
    else
      redirect_to course_assessment_question_bundles_path(current_course, @assessment),
                  danger: @question_bundle.errors.full_messages.to_sentence

    end
  end

  private

  def add_breadcrumbs
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
    add_breadcrumb('Question Bundles', course_assessment_question_bundles_path(current_course, @assessment))
  end

  def question_bundle_params
    params.require(:question_bundle).permit(:title, :group_id)
  end
end
