FactoryGirl.define do
  factory :instance_announcement, class: Instance::Announcement.name do
    instance
    creator
    updater

    sequence(:title) { |n| "Announcement #{n}" }
    sequence(:content) { |n| "Content #{n}" }

    valid_from Time.now
    valid_to 3.days.from_now
  end
end
