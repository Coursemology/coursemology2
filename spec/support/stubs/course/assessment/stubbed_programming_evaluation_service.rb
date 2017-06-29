# frozen_string_literal: true
module Course::Assessment::StubbedProgrammingEvaluationService
  private

  def evaluate_in_container
    attributes = FactoryGirl.attributes_for(:course_assessment_programming_evaluation, :completed).
                   slice(:stdout, :stderr, :test_report, :exit_code)
    # For timeout testing
    sleep(0.2)

    [attributes[:stdout], attributes[:stderr], attributes[:test_report], attributes[:exit_code]]
  end
end

Course::Assessment::ProgrammingEvaluationService.class_eval do
  prepend Course::Assessment::StubbedProgrammingEvaluationService
end
