# frozen_string_literal: true
json.autogradable question.auto_gradable?

case question.question_type_sym
when :file_upload
  json.maxAttachments question.max_attachments
  json.maxAttachmentSize question.computed_max_attachment_size
  json.isAttachmentRequired question.is_attachment_required

when :text_response
  json.maxAttachments question.max_attachments
  json.maxAttachmentSize question.computed_max_attachment_size if question.max_attachments > 0
  json.isAttachmentRequired question.is_attachment_required

  if can_grade && question.auto_gradable?
    json.solutions question.solutions.each do |solution|
      json.id solution.id
      json.solutionType solution.solution_type
      # Do not sanitize the solution here to prevent double sanitization.
      # Sanitization will be handled automatically by the React frontend.
      json.solution solution.solution
      json.grade solution.grade
    end
  end
when :comprehension
  if can_grade && question.auto_gradable?
    json.groups question.groups.each do |group|
      json.id group.id
      json.maximumGroupGrade group.maximum_group_grade

      json.points group.points.each do |point|
        json.id point.id
        json.pointGrade point.point_grade

        json.solutions point.solutions.each do |s|
          json.id s.id
          json.solutionType s.solution_type
          # Do not sanitize the solution here to prevent double sanitization.
          # Sanitization will be handled automatically by the React frontend.
          json.solution s.solution.join(', ')
          json.solutionLemma s.solution_lemma.join(', ')
          json.information s.information
        end
      end
    end
  end
end
