# frozen_string_literal: true
FactoryBot.define do
  factory :duplication_traceable_course, class: 'DuplicationTraceable::Course' do
    source { build(:course) }
    course
  end
end
