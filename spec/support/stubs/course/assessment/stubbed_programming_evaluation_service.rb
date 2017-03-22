# frozen_string_literal: true
module Course::Assessment::StubbedProgrammingEvaluationService
  private

  def wait_for_evaluation(evaluation)
    thread = Thread.new do
      ActiveRecord::Base.connection_pool.with_connection do
        ActsAsTenant.without_tenant do
          populate_mock_result(evaluation)
        end
      end
    end
    thread.abort_on_exception = true

    super
  end

  # Populates the evaluation with fake results.
  #
  # @param [Course::Assessment::ProgrammingEvaluation] evaluation The evaluation to populate
  #   mock results for.
  def populate_mock_result(evaluation)
    evaluation = Course::Assessment::ProgrammingEvaluation.find(evaluation.id)
    attributes = FactoryGirl.
                 attributes_for(:course_assessment_programming_evaluation, :completed).
                 slice(:stdout, :stderr, :test_report, :exit_code)
    evaluation.assign!(User.system)
    evaluation.assign_attributes(attributes)
    evaluation.complete!
    evaluation.save!
  end
end

Course::Assessment::ProgrammingEvaluationService.class_eval do
  prepend Course::Assessment::StubbedProgrammingEvaluationService
end
