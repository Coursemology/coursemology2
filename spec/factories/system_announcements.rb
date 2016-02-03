# frozen_string_literal: true
FactoryGirl.define do
  factory :system_announcement, class: System::Announcement.name, parent: :generic_announcement do
  end
end
