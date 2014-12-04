FactoryGirl.define do
  sequence :hostnames, Time.now.to_i, aliases: [:host] do |n|
    "www.local#{n}.com"
  end

  factory :instance do
    host
  end
end
