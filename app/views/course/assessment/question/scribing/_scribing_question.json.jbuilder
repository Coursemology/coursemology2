json.question do
  json.(@scribing_question, :id, :title, :description, :staff_only_comments, :maximum_grade,
    :weight)

  if @scribing_question.attachment_reference
    json.attachment_reference do
      json.partial! 'attachments/attachment_reference.json',
                    attachment_reference: @scribing_question.attachment_reference
    end
  else
    json.attachment_reference nil
  end

  # TODO: Shift skills out into a separate partial.
  json.skill_ids @scribing_question.skills.order_by_title.as_json(only: [:id, :title])
  json.skills current_course.assessment_skills.order_by_title do |skill|
    json.(skill, :id, :title)
  end

  json.published_assessment @assessment.published?
end
