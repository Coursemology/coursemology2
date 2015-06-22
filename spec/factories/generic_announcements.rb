FactoryGirl.define do
  factory :generic_announcement, class: System::Announcement.name do
    creator
    updater

    sequence(:title) { |n| "Announcement #{n}" }
    sequence(:content) { |n| "Content #{n}" }

    valid_from Time.zone.now
    valid_to 3.days.from_now
  end
end
