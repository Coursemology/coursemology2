# frozen_string_literal: true
class Course::Video::Submission < ActiveRecord::Base
  include Course::Video::Submission::TodoConcern

  acts_as_experience_points_record

  after_create :send_attempt_notification

  schema_validations except: [:creator_id, :video_id]
  validate :validate_consistent_user, :validate_unique_submission, on: :create

  belongs_to :video, inverse_of: :submissions

  private

  # Validate that the submission creator is the same user as the course_user in the associated
  # experience_points_record.
  def validate_consistent_user
    return if course_user && course_user.user == creator
    errors.add(:experience_points_record, :inconsistent_user)
  end

  # Validate that the submission creator does not have an existing submission for this assessment.
  def validate_unique_submission
    existing = Course::Video::Submission.find_by(video_id: video.id, creator_id: creator.id)
    return unless existing
    errors.clear
    errors[:base] << I18n.t('activerecord.errors.models.course/video/submission.'\
                            'submission_already_exists')
  end

  def send_attempt_notification
    return unless course_user.real_student?

    Course::VideoNotifier.video_attempted(creator, video)
  end
end
