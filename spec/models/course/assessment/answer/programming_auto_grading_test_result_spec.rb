require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingAutoGradingTestResult do
  it 'belongs to an auto grading' do
    expect(subject).to belong_to(:auto_grading).
      class_name(Course::Assessment::Answer::ProgrammingAutoGrading.name)
  end
end
