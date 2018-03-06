# frozen_string_literal: true
class Course::Assessment::QuestionsController < Course::Assessment::Controller
  load_and_authorize_resource :question, class: Course::Assessment::Question, through: :assessment
  before_action :load_and_authorize_destination_assessment, only: :duplicate

  def duplicate
    if @destination_assessment.questions << duplicated_question
      flash.now[:success] =
        t('.success', destination_name: @destination_assessment.title,
                      destination_link: course_assessment_path(current_course, @destination_assessment))
    else
      flash.now[:danger] = @destination_assessment.errors.full_messages.to_sentence
    end
  end

  private

  def load_and_authorize_destination_assessment
    @destination_assessment = Course::Assessment.find(params[:destination_assessment_id])
    authorize! :update, @destination_assessment
  end

  # Duplicates the target question and associates skills, if any.
  # It currently assumes that the destination assessment's course is the current course.
  #
  # @return [Course::Assessment::Question] The duplicated question
  def duplicated_question
    duplicator = Duplicator.new({}, current_course: current_course)
    duplicator.duplicate(@question.specific).tap do |duplicate|
      duplicate.skills = @question.skills
    end.acting_as
  end
end
