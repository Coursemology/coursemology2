# frozen_string_literal: true
FactoryBot.define do
  factory :learning_rate_record, class: 'Course::LearningRateRecord' do
    course_user
    learning_rate { 1.0 }
    effective_min { 0.5 }
    effective_max { 2.0 }
  end
end
