# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.questionType question.question_type_sym
json.isAssessmentAutograded assessment.autograded?
json.defaultMaxAttachmentSize question.default_max_attachment_size
json.defaultMaxAttachments question.default_max_attachments

json.partial! 'solution_details', question: question unless question.file_upload_question?
