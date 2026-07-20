# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_access_block,
          class: 'Course::Assessment::Marketplace::AccessBlock' do
    association :user
    association :creator, factory: :user
  end
end
