# frozen_string_literal: true
json.ids @available_assessments.map(&:id)

json.assessments do
  @available_assessments.each do |assessment|
    json.set! assessment.id, {
      title: assessment.title,
      url: course_scholaistic_assessment_path(current_course, assessment)
    }
  end
end
