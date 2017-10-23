# frozen_string_literal: true
class Course::Assessment::Question::AnswersEvaluationJob < ApplicationJob
  def perform(question)
    ActsAsTenant.without_tenant do
      Course::Assessment::Question::AnswersEvaluationService.new(question).call
    end
  end
end
