json.hideText question.hide_text
json.isAttachmentRequired question.is_attachment_required
json.maxAttachments question.max_attachments
json.maxAttachmentSize question.max_attachment_size
json.isComprehension question.is_comprehension
json.solutions question.solutions do |solution|
  json.solutionType solution.solution_type
  json.solution format_ckeditor_rich_text(solution.solution)
  json.grade solution.grade
  json.explanation format_ckeditor_rich_text(solution.explanation)
end