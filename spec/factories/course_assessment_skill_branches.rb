FactoryGirl.define do
  factory :course_assessment_skill_branch, class: Course::Assessment::SkillBranch do
    course
    title 'Skill Branch'
    description 'Branch description'
  end
end
