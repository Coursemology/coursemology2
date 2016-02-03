# frozen_string_literal: true
FactoryGirl.define do
  factory :instance_announcement, class: Instance::Announcement.name,
                                  parent: :generic_announcement do
    transient do
      instance
    end
  end
end
