# frozen_string_literal: true
FactoryGirl.define do
  factory :course_user do
    user
    course
    phantom false
    role :student
    name 'default'

    trait :approved do
      workflow_state :approved
    end
    trait :invited do
      workflow_state :invited
    end
    trait :rejected do
      workflow_state :rejected
    end
    trait :phantom do
      phantom true
    end

    # Course Student is an approved course_user by default.
    # Manually build a course_user for unapproved course_users.
    factory :course_student, parent: :course_user do
      approved
      sequence(:name) { |n| "student #{n}" }
    end

    # Course Teaching Assistant is an approved course_user by default.
    # Manually build a course_user for unapproved course_users.
    factory :course_teaching_assistant, parent: :course_user do
      approved
      role :teaching_assistant
      sequence(:name) { |n| "teaching assistant #{n}" }
    end

    # Course Manager is an approved course_user by default.
    # Manually build a course_user for unapproved course_users.
    factory :course_manager, parent: :course_user do
      approved
      role :manager
      sequence(:name) { |n| "manager #{n}" }
    end

    # Course Owner is an approved course_user by default.
    factory :course_owner, parent: :course_user do
      approved
      role :owner
      sequence(:name) { |n| "owner #{n}" }
    end

    trait :auto_grader do
      role :auto_grader
    end
  end
end
