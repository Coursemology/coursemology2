# frozen_string_literal: true
class Course::Assessment::QuestionBundleQuestionsController < Course::Assessment::Controller
  load_and_authorize_resource :question_bundle_question, class: Course::Assessment::QuestionBundleQuestion,
                                                         through: :assessment
  skip_load_resource :question_bundle_question, only: [:new, :create]

  before_action :add_breadcrumbs

  def index
    @question_bundle_questions =
      Course::Assessment::QuestionBundleQuestion.where(id: @question_bundle_questions).
      joins(question_bundle: :question_group).
      merge(Course::Assessment::QuestionGroup.order(:weight)).
      merge(Course::Assessment::QuestionBundle.order(:id)).
      merge(Course::Assessment::QuestionBundleQuestion.order(:weight))
  end

  def new
    @question_bundle_question = Course::Assessment::QuestionBundleQuestion.new
  end

  def create
    @question_bundle_question = Course::Assessment::QuestionBundleQuestion.new(question_bundle_question_params)
    if @question_bundle_question.save
      redirect_to course_assessment_question_bundle_questions_path(current_course, @assessment)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @question_bundle_question.update(question_bundle_question_params)
      redirect_to course_assessment_question_bundle_questions_path(current_course, @assessment)
    else
      render 'edit'
    end
  end

  def destroy
    if @question_bundle_question.destroy
      redirect_to course_assessment_question_bundle_questions_path(current_course, @assessment)
    else
      redirect_to course_assessment_question_bundle_questions_path(current_course, @assessment),
                  danger: @question_bundle_question.errors.full_messages.to_sentence
    end
  end

  private

  def add_breadcrumbs
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
    add_breadcrumb('Question Bundle Questions',
                   course_assessment_question_bundle_questions_path(current_course, @assessment))
  end

  def question_bundle_question_params
    params.require(:question_bundle_question).permit(:weight, :bundle_id, :question_id)
  end
end
