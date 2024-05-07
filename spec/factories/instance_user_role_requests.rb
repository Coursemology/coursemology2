# frozen_string_literal: true
FactoryBot.define do
  factory :instance_user_role_request, aliases: [:role_request], class: 'Instance::UserRoleRequest' do
    instance
    user { build(:instance_user, instance: instance).user }
    role { :instructor }
    organization { 'NUS' }
    designation { 'Lecturer' }
    reason { 'I like coursemology' }

    trait :pending do
      workflow_state { :pending }
    end

    trait :approved do
      workflow_state { :approved }
    end

    trait :rejected do
      workflow_state { :rejected }
    end
  end
end
