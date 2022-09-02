# frozen_string_literal: true
module Course::Assessment::StubbedProgrammingEvaluationService
  private

  def evaluate_in_container
    attributes = { stdout: '',
                   stderr: '',
                   test_reports: { report: File.read(
                     Rails.root.join('spec/fixtures/course/' \
                                     'programming_multiple_test_suite_report.xml')
                   ) },
                   exit_code: 0 }
    # For timeout testing
    sleep 0.2

    [attributes[:stdout], attributes[:stderr], attributes[:test_reports], attributes[:exit_code]]
  end
end

module Course::Assessment::StubbedProgrammingEvaluationServiceForCodaveriTest
  private

  def evaluate_in_container
    attributes = { stdout: '',
                   stderr: '',
                   test_reports: { report: nil, private: File.read(
                     Rails.root.join('spec/fixtures/course/' \
                                     'programming_private_test_report.xml')
                   ), public: File.read(
                     Rails.root.join('spec/fixtures/course/' \
                                     'programming_public_test_report.xml')
                   ) },
                   exit_code: 0 }
    # For timeout testing
    sleep 0.2

    [attributes[:stdout], attributes[:stderr], attributes[:test_reports], attributes[:exit_code]]
  end
end

Course::Assessment::ProgrammingEvaluationService.class_eval do
  prepend Course::Assessment::StubbedProgrammingEvaluationService
end
