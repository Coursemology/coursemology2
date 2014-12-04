FactoryGirl.define do
  sequence :host, Time.now.to_i do |n|
    "local#{n}.com"
  end

  factory :instance do
    host
  end
end
