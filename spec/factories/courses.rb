FactoryGirl.define do
  factory :course do
    title 'example'
    description 'example course'
    start_at Time.zone.now
    end_at 7.days.from_now

    factory :open_course do
      status :opened
    end
  end
end
