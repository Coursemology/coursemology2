# frozen_string_literal: true
module Course::Assessment::StubbedProgrammingEvaluationService
  private

  def evaluate_in_container
    attributes = { stdout: '',
                   stderr: '',
                   test_report: File.read(Rails.root.join('spec/fixtures/course/' \
                                                          'programming_multiple_test_suite_report.xml')),
                   exit_code: 0 }
    # For timeout testing
    sleep(0.2)

    [attributes[:stdout], attributes[:stderr], attributes[:test_report], attributes[:exit_code]]
  end
end

Course::Assessment::ProgrammingEvaluationService.class_eval do
  prepend Course::Assessment::StubbedProgrammingEvaluationService
end
