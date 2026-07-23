# frozen_string_literal: true
class Course::Assessment::PreviewAttemptReapingJob < ApplicationJob
  TTL = 7.days

  def perform
    Course::Assessment::PreviewAttempt.where(created_at: ..TTL.ago).find_each(&:destroy!)
  end
end
