# frozen_string_literal: true
class Course::Assessment::QuestionsController < Course::Assessment::Controller
  load_and_authorize_resource :question, class: Course::Assessment::Question, through: :assessment
  before_action :load_and_authorize_assessments, only: :duplicate

  # The current assumption is that the destination assessment's course is the same as the current
  # course for this action.
  # Thus the skills just have to assigned to the new question_assessment, instead of going through
  # the Duplicator like the usual process for duplicating question_assessments.
  def duplicate
    if duplicate_question_and_skills
      flash.now[:success] =
        t('.success', destination_name: @destination_assessment.title,
                      destination_link: course_assessment_path(current_course, @destination_assessment))
    else
      flash.now[:danger] = @destination_assessment.errors.full_messages.to_sentence
    end
  end

  private

  def load_and_authorize_assessments
    @destination_assessment = Course::Assessment.find(params[:destination_assessment_id])
    authorize! :update, @destination_assessment

    @source_assessment = Course::Assessment.find(params[:assessment_id])
  end

  # Duplicates the target question, skills can only be assigned with a question_assessment.
  # It currently assumes that the destination assessment's course is the current course.
  #
  # @return [Course::Assessment::Question] The duplicated question
  def duplicated_question
    duplicator = Duplicator.new({}, current_course: current_course)
    duplicator.duplicate(@question.specific).acting_as
  end

  def duplicate_question_and_skills
    destination_question_assessment = duplicated_question.question_assessments.
                                      build(assessment: @destination_assessment)
    source_question_assessment = @question.question_assessments.
                                 select { |qa| qa.assessment == @source_assessment }.first
    destination_question_assessment.skills = source_question_assessment.skills
    @destination_assessment.question_assessments << destination_question_assessment
  end
end
