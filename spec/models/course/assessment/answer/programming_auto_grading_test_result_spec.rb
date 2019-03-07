# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingAutoGradingTestResult do
  it 'belongs to an auto grading' do
    expect(subject).to belong_to(:auto_grading).
      class_name(Course::Assessment::Answer::ProgrammingAutoGrading.name).
      inverse_of(:test_results)
  end

  it 'belongs to a test case' do
    expect(subject).to belong_to(:test_case).
      class_name(Course::Assessment::Question::ProgrammingTestCase.name).
      inverse_of(nil).optional
  end
end
