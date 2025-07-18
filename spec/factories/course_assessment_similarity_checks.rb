# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_similarity_check, class: 'Course::Assessment::SimilarityCheck' do
    association :assessment, factory: :assessment
  end
end
