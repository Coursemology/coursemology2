FactoryGirl.define do
  factory :course_experience_points_record, class: Course::ExperiencePointsRecord.name do
    course_user
    points_awarded { rand(1..20) * 100 }
    reason 'EXP for some event'

    trait :inactive do
      points_awarded nil
    end
  end
end
