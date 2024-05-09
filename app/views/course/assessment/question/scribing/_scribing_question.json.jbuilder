# frozen_string_literal: true
json.question do
  json.(@scribing_question, :id, :title, :staff_only_comments, :maximum_grade)
  json.description format_ckeditor_rich_text(@scribing_question.description)
  if @scribing_question.attachment_reference
    json.attachment_reference do
      json.partial! 'attachments/attachment_reference.json',
                    attachment_reference: @scribing_question.attachment_reference
      json.image_url @scribing_question.attachment_reference.generate_public_url
    end
  else
    json.attachment_reference nil
  end

  # TODO: Shift skills out into a separate partial.
  json.skill_ids @question_assessment.skills.order_by_title.pluck(:id)
  json.skills current_course.assessment_skills.order_by_title do |skill|
    json.(skill, :id, :title)
  end

  json.published_assessment @assessment.published?
end
