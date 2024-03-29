# frozen_string_literal: true
FactoryBot.define do
  factory :duplication_traceable_assessment, class: DuplicationTraceable::Assessment.name do
    source { build(:assessment) }
    assessment
  end
end
