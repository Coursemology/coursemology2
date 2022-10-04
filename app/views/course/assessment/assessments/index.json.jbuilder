# frozen_string_literal: true
json.array! @assessments do |assessment|
  json.id assessment.id
  json.title assessment.title
  json.description assessment.description
  json.published assessment.published
  json.baseExp assessment.base_exp
  json.timeBonusExp assessment.time_bonus_exp
  json.hasPersonalTimes assessment.has_personal_times
  json.affectsPersonalTimes assessment.affects_personal_times
  json.tabId assessment.tab_id
  json.autograded assessment.autograded
  json.sessionPassword assessment.session_password
  json.tabbedView assessment.tabbed_view
  json.skippable assessment.skippable
  json.delayedGradePublication assessment.delayed_grade_publication
  json.showPrivate assessment.show_private
  json.showEvaluation assessment.show_evaluation
  json.viewPassword assessment.view_password
  json.usePublic assessment.use_public
  json.usePrivate assessment.use_private
  json.useEvaluation assessment.use_evaluation
  json.allowPartialSubmission assessment.allow_partial_submission
  json.randomization assessment.randomization
  json.showMcqAnswer assessment.show_mcq_answer
  json.showMcqMrqSolution assessment.show_mcq_mrq_solution
  json.blockStudentViewingAfterSubmitted assessment.block_student_viewing_after_submitted
end
