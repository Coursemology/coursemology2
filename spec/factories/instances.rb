FactoryGirl.define do
  base_time = Time.now.to_i
  sequence :host do |n|
    "local_#{base_time}_#{n}.com"
  end

  factory :instance do
    host
  end
end
