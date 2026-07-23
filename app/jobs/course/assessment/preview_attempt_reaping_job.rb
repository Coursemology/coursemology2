# frozen_string_literal: true
# Deletes throwaway marketplace preview attempts (bare Attempts with no Submission extension) older than
# TTL, cascading their answers/submission_questions via `dependent: :destroy`. `Attempt.previews` scopes to
# extension-less rows, so real submissions are never touched regardless of age.
class Course::Assessment::PreviewAttemptReapingJob < ApplicationJob
  TTL = 7.days

  def perform
    Course::Assessment::Attempt.previews.where(created_at: ..TTL.ago).find_each(&:destroy!)
  end
end
