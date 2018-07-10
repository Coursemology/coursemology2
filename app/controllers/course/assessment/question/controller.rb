# frozen_string_literal: true
class Course::Assessment::Question::Controller < Course::Assessment::ComponentController
  before_action :authorize_assessment

  # Use method to build new questions.
  #
  # Cancancan uses `assessment.specific_questions.build` to build a resource, which will break since the specific
  # questions are nested through `question_assessments` and AR does not support build associations with nested
  # has_many through.
  def self.build_and_authorize_new_question(question_name, options)
    before_action only: options[:only], except: options[:except] do
      question = options[:class].new
      @question_assessment = question.question_assessments.build(assessment: @assessment)
      if action_name != 'new'
        question_params = send("#{question_name}_params")
        @question_assessment.skill_ids = question_params[:question_assessment].try(:[], :skill_ids)
        question.assign_attributes(question_params.except(:question_assessment))
      end
      authorize!(action_name.to_sym, question)
      instance_variable_set("@#{question_name}", question) unless instance_variable_get("@#{question_name}")
    end
  end

  def load_question_assessment_for(question)
    @assessment.question_assessments.find_by!(question: question.acting_as)
  end

  protected

  def authorize_assessment
    authorize!(:update, @assessment)
  end
end
