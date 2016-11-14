# frozen_string_literal: true
class Course::Assessment::Question::AnswersEvaluationJob < ApplicationJob
  def perform(question)
    instance = Course.unscoped { question.assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Question::AnswersEvaluationService.new(question).call
    end
  end
end
