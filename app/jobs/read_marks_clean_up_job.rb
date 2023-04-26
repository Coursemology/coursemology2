# frozen_string_literal: true
class ReadMarksCleanUpJob < ApplicationJob
  def perform
    ReadMark.readable_classes.each do |klass|
      Rails.logger.debug(message: "Starting read marks cleanup job for #{klass} at #{Time.now}")
      klass.cleanup_read_marks!
      Rails.logger.debug(message: "Ended read marks cleanup job for #{klass} at #{Time.now}")
    end
  end
end
