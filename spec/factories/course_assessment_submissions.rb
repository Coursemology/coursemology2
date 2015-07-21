FactoryGirl.define do
  factory :course_assessment_submission, class: Course::Assessment::Submission,
                                         aliases: [:submission] do
    transient do
      course { create(:course) }
      user { create(:user) }
      course_user do
        course.course_users.find_by(user: user) ||
          create(:course_user, course: course, user: user)
      end
    end

    assessment { build(:assessment, course: course) }
    experience_points_record do
      build(:course_experience_points_record, course_user: course_user)
    end
  end
end
