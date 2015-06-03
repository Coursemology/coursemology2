FactoryGirl.define do
  factory :instance_announcement, class: Instance::Announcement.name do
    transient do
      instance
    end
    creator
    updater

    sequence(:title) { |n| "Announcement #{n}" }
    sequence(:content) { |n| "Content #{n}" }

    sequence(:valid_from) { |n| Time.zone.now + n.seconds }
    sequence(:valid_to) { |n| 3.days.from_now + n.seconds }
  end
end
