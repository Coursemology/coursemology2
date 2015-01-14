FactoryGirl.define do
  factory :course_announcement, class: Course::Announcement.name do
    course
    creator
    updater
    sequence(:title)  { |n| "Announcement #{n}" }
    sequence(:content) { |n| "Content #{n}" }
    valid_from Time.now
    valid_to 3.days.from_now
  end

end
