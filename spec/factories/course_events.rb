FactoryGirl.define do
  factory :course_event, class: 'Course::Event' do
    course
    start_time 1.days.from_now
    sequence(:title) { |n| "Example Course Event #{n}" }
    description 'Funky description'
    location 'Cool location'
  end

  factory :recitation, parent: :course_event do
    event_type :recitation
    sequence(:title) { |n| "Example Recitation #{n}" }
  end

  factory :tutorial, parent: :course_event do
    event_type :tutorial
    sequence(:title) { |n| "Example Tutorial #{n}" }
  end

  factory :lecture, parent: :course_event do
    event_type :lecture
    sequence(:title) { |n| "Example Lecture #{n}" }
  end
end
