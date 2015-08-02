FactoryGirl.define do
  factory :course_announcement, class: Course::Announcement.name do
    course
    sequence(:title)  { |n| "Announcement #{n}" }
    sequence(:content) { |n| "Content #{n}" }
    start_at Time.zone.now
    end_at 3.days.from_now
  end
end
