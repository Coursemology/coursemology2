# frozen_string_literal: true
FactoryBot.define do
  factory :group_user, class: 'Course::GroupUser' do
    association :course_user, factory: :course_user
    association :group, factory: :course_group
    association :creator, factory: :user
    association :updater, factory: :user
  end
end
