# frozen_string_literal: true
json.array! @assessments do |assessment|
  num_submitted = @num_submitted_students_hash[assessment.id] || 0

  json.id assessment.id
  json.title assessment.title
  json.url course_assessment_path(current_course, assessment)
  json.plagiarismUrl plagiarism_course_assessment_path(current_course, assessment)
  json.submissionsUrl course_assessment_submissions_path(current_course, assessment)

  json.numCheckableQuestions @num_plagiarism_checkable_questions_hash[assessment.id] || 0
  json.numSubmitted num_submitted
  json.lastSubmittedAt @latest_submission_time_hash[assessment.id]&.iso8601
  json.numLinkedAssessments (@linked_assessment_counts_hash[assessment.id] || 0) + 1

  if assessment.plagiarism_check
    json.plagiarismCheck do
      json.partial! 'plagiarism_check', locals: { plagiarism_check: assessment.plagiarism_check }
    end
  end
end
