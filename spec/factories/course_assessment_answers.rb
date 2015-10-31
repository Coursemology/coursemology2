FactoryGirl.define do
  factory :course_assessment_answer, class: Course::Assessment::Answer do
    transient do
      course { build(:course) }
      assessment { build(:assessment, course: course) }
    end

    submission { build(:course_assessment_submission, assessment: question.assessment) }
    question { build(:course_assessment_question, assessment: assessment) }
  end
end
