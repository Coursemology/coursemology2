# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_plagiarism_check, class: 'Course::Assessment::PlagiarismCheck' do
    association :assessment, factory: :assessment
  end
end
