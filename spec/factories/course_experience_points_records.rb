# frozen_string_literal: true
FactoryGirl.define do
  factory :course_experience_points_record, class: Course::ExperiencePointsRecord.name do
    transient do
      course { create(:course) }
      creator
    end

    course_user do
      course.course_users.find_by(user: creator) ||
        # We need a persisted course_user for instance methods from calculated_attributes to be
        # reused.
        create(:course_user, course: course, user: creator)
    end
    points_awarded { rand(1..20) * 100 }
    draft_points_awarded nil
    awarded_at nil
    awarder { creator }
    reason { 'Reason for manually-awarded experience points' if manually_awarded? }

    trait :inactive do
      points_awarded nil
    end

    trait :draft do
      inactive
      draft_points_awarded { rand(1..20) * 100 }
      awarded_at nil
      awarder nil
    end
  end
end
