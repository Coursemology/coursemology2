FactoryGirl.define do
  factory :course do
    title 'example'
    description 'example course'
    start_at Time.now
    end_at 7.days.from_now
    creator
  end
end
