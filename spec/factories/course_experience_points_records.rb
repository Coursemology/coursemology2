FactoryGirl.define do
  factory :course_experience_points_record, class: Course::ExperiencePointsRecord.name do
    creator
    updater
    course_user
    points_awarded 100
    reason 'EXP for some event'
  end
end
