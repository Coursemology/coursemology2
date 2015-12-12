FactoryGirl.define do
  factory :course do
    sequence(:title) do |n|
      timestamp = Time.zone.now.to_i.to_s
      "Course #{timestamp + n.to_s}"
    end
    description 'example course'
    start_at Time.zone.now
    end_at 7.days.from_now

    factory :open_course do
      status :opened
    end
  end
end
