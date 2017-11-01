FactoryBot.define do
  factory :course_assessment_skill_branch, class: Course::Assessment::SkillBranch do
    course
    title 'Skill Branch'
    description 'Branch description'

    transient do
      skill_count 1
    end

    trait :with_skill do
      after(:build) do |branch, evaluator|
        evaluator.skill_count.downto(1).each do
          create(:course_assessment_skill, skill_branch: branch, course: branch.course)
        end
      end
    end
  end
end
