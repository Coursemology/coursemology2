FactoryGirl.define do
  base_time = Time.now.to_i
  sequence :host do |n|
    "local-#{base_time}-#{n}.com"
  end

  factory :instance do
    sequence(:name) { |n| "Instance#{n}" }
    host
  end
end
