# frozen_string_literal: true
FactoryBot.define do
  factory :instance_announcement, class: 'Instance::Announcement',
                                  parent: :generic_announcement do
    transient do
      instance
    end
  end
end
