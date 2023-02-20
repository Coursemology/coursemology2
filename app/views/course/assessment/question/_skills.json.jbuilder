# frozen_string_literal: true
json.availableSkills do
  course.assessment_skills.each do |skill|
    json.set! skill.id, {
      id: skill.id,
      title: skill.title,
      description: skill.description
    }
  end
end

json.skillsUrl course_assessments_skills_path(course)
