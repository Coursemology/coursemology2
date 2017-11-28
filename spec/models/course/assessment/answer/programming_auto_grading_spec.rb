# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingAutoGrading do
  it { is_expected.to act_as(Course::Assessment::Answer::AutoGrading) }
  it 'has one programming answer' do
    expect(subject).to have_one(:programming_answer).
      class_name(Course::Assessment::Answer::Programming.name)
  end
  it 'has many test results' do
    expect(subject).to have_many(:test_results).
      class_name(Course::Assessment::Answer::ProgrammingAutoGradingTestResult.name).
      with_foreign_key(:auto_grading_id)
  end
end
