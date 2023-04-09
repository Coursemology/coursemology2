# frozen_string_literal: true

json.answerAutogradingJob @current_answers_jobs.each do |answer, job|
  json.id answer.id
  json.questionId answer.question.id
  json.job do
    json.partial! "jobs/#{job.status}", job: job
  end
end
