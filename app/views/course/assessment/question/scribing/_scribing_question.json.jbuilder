json.question do
  json.(@scribing_question, :id, :title, :description, :staff_only_comments, :maximum_grade,
    :weight)
  json.skill_ids @scribing_question.skills.order('LOWER(title) ASC').as_json(only: [:id, :title])
  json.skills current_course.assessment_skills.order('LOWER(title) ASC') do |skill|
    json.(skill, :id, :title)
  end

  json.published_assessment @assessment.published?
  json.attempt_limit @scribing_question.attempt_limit
end
