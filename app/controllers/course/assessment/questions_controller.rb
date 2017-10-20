# frozen_string_literal: true
class Course::Assessment::QuestionsController < Course::Assessment::ComponentController
  before_action :authorize_assessment

  def load_question_assessment_for(question)
    @assessment.question_assessments.find_by(question: question.acting_as)
  end

  protected

  def authorize_assessment
    authorize!(:update, @assessment)
  end
end
