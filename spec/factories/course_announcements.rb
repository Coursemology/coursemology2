FactoryGirl.define do
  factory :course_announcement, class: Course::Announcement.name do
    course
    sequence(:title)  { |n| "Announcement #{n}" }
    sequence(:content) { |n| "Content #{n}" }
    valid_from Time.zone.now
    valid_to 3.days.from_now
  end
end
