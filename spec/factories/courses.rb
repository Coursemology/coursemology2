FactoryGirl.define do
  factory :course do
    sequence(:title) { |n| "Example course #{n}" }
    description 'example course'
    start_at Time.zone.now
    end_at 7.days.from_now

    factory :open_course do
      status :opened
    end
  end
end
