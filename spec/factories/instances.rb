# frozen_string_literal: true
FactoryGirl.define do
  base_time = Time.zone.now.to_i
  sequence :host do |n|
    "local-#{base_time}-#{n}.lvh.me"
  end

  factory :instance do
    sequence(:name) { |n| "Instance#{n}" }
    host
  end
end
