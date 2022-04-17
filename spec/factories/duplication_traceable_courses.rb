# frozen_string_literal: true
FactoryBot.define do
  factory :duplication_traceable_course, class: DuplicationTraceable::Course.name do
    source { build(:course) }
    course
  end
end
