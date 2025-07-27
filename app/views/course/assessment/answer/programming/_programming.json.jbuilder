# frozen_string_literal: true
submission = answer.submission
assessment = submission.assessment
# If a non current_answer is being loaded, use it instead of loading the last_attempt.
is_current_answer = answer.current_answer?
latest_answer = last_attempt(answer)
attempt = is_current_answer ? latest_answer : answer

auto_grading = attempt&.auto_gradings&.last&.specific
question = auto_grading&.question_snapshot || answer.question.specific
json.autoGradingCount attempt&.auto_gradings&.count
json.gradedOnPastSnapshot answer.question.specific != question
test_cases_by_type = question.test_cases_by_type

can_grade = can?(:grade, submission)
can_read_tests = can?(:read_tests, submission)
show_private = can_read_tests || (submission.published? && assessment.show_private?)
show_evaluation = can_read_tests || (submission.published? && assessment.show_evaluation?)

# Required in response of reload_answer and submit_answer to update past answers with the latest_attempt
# Removing this check will cause it to render the latest_answer recursively
if is_current_answer && !latest_answer.current_answer?
  json.latestAnswer do
    json.partial! latest_answer, answer: latest_answer
    json.partial! 'course/assessment/answer/programming/annotations', programming_files: latest_answer.specific.files,
                                                                      can_grade: can_grade
  end
end

json.questionType answer.question.question_type

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.files_attributes answer.files do |file|
    json.(file, :id, :filename)
    json.content file.content
    json.highlightedContent highlight_code_block(file.content, question.language)
  end
end

json.canReadTests can_read_tests
if attempt.submitted? && !attempt&.auto_gradings&.any?
  json.autogradings do
    json.child! do
      json.job do
        json.status :submitted
      end
    end
  end
end

displayed_test_case_types = ['public_test']
displayed_test_case_types << 'private_test' if show_private
displayed_test_case_types << 'evaluation_test' if show_evaluation

# If the answer has no auto gradings, include the test cases directly here.
# Otherwise, read the test cases from the auto grading.

json.testCases do
  displayed_test_case_types.each do |test_case_type|
    json.set! test_case_type do
      if test_cases_by_type[test_case_type].present?
        json.array! test_cases_by_type[test_case_type] do |test_case|
          json.partial! 'course/assessment/answer/programming/test_case',
                        test_case: test_case,
                        can_read_tests: can_read_tests
        end
      end
    end
  end
end

json.autogradings do
  json.array! attempt&.auto_gradings&.map(&:specific)&.compact do |auto_grading|
    json.partial! 'course/assessment/answer/programming/auto_grading', assessment: assessment,
                  submission: submission,
                  question: question,
                  auto_grading: auto_grading,
                  can_read_tests: can_read_tests,
                  displayed_test_case_types: displayed_test_case_types
  end
end

job = attempt&.auto_gradings&.last&.job

if job
  json.autograding do
    json.path job_path(job) if job.submitted?
    json.partial! "jobs/#{job.status}", job: job
  end
end

if attempt.submitted? && !attempt&.auto_gradings&.any?
  json.autograding do
    json.status :submitted
  end
end

json.explanation do
  if auto_grading
    test_results_by_type = get_test_results_by_type(test_cases_by_type, auto_grading)
    first_failures_by_type = get_first_test_failures_by_type(test_cases_by_type, test_results_by_type)
    explanations = []

    if first_failures_by_type['public_test']
      explanations << format_ckeditor_rich_text(get_hint(
        first_failures_by_type['public_test'],
        test_results_by_type['public_test'][first_failures_by_type['public_test'].id]
      ))
      json.failureType 'public_test'

    elsif first_failures_by_type['private_test']
      explanations << format_ckeditor_rich_text(get_hint(
        first_failures_by_type['private_test'],
        test_results_by_type['private_test'][first_failures_by_type['private_test'].id]
      ))
      json.failureType 'private_test'
    end

    passed_evaluation_tests = first_failures_by_type['evaluation_test'].blank?

    json.correct attempt&.correct && (can_grade ? passed_evaluation_tests : true)
    json.explanations explanations
  end
end

json.attemptsLeft answer.attempting_times_left if question.attempt_limit

if answer.codaveri_feedback_job_id && question.is_codaveri
  codaveri_job = answer.codaveri_feedback_job
  json.codaveriFeedback do
    json.jobId answer.codaveri_feedback_job_id
    json.jobStatus codaveri_job.status
    json.jobUrl job_path(codaveri_job) if codaveri_job.status == 'submitted'
    json.errorMessage codaveri_job.error['message'] if codaveri_job.error
  end
end
