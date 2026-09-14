# frozen_string_literal: true
json.questions @questions do |question|
  question_assessment = question.question.question_assessments.first
  assessment = question_assessment&.assessment
  targets = @upgrade_targets_hash.fetch(question.language_id, [])

  json.id question.id
  json.title question_assessment&.display_title
  json.editUrl edit_course_assessment_question_programming_path(current_course, assessment, question) if assessment

  if assessment
    json.assessment do
      json.id assessment.id
      json.title assessment.title
      json.url course_assessment_path(current_course, assessment)
    end
    json.submissionCount @submission_counts_hash.fetch(assessment.id, 0)
  else
    json.submissionCount 0
  end

  # Languages are sent once in the `languages` section below and referenced by id here, rather than
  # repeated in full on every row.
  json.languageId question.language_id

  # The versions this question may be moved to, newest first. The client defaults the row's dropdown
  # to the first entry.
  json.upgradeTargetIds targets.map(&:id)
  json.upgradable targets.first.present? && targets.first.id != question.language_id

  upgrade = question.upgrade
  if upgrade
    json.upgrade do
      json.partial! 'upgrade', locals: { upgrade: upgrade }
    end
  end
end

# Every language, keyed by id on the client. The table is a couple of dozen rows, so sending it whole
# is cheaper than deduplicating the subset actually referenced.
json.languages do
  json.array! @languages do |language|
    json.partial! 'language', locals: { language: language }
  end
end

json.rowCount @row_count
