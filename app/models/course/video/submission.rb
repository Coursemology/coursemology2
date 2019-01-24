# frozen_string_literal: true
class Course::Video::Submission < ApplicationRecord
  include Course::Video::Submission::TodoConcern
  include Course::Video::Submission::NotificationConcern
  include Course::Video::WatchStatisticsConcern

  acts_as_experience_points_record

  validate :validate_consistent_user, :validate_unique_submission, on: :create
  validates :creator, presence: true
  validates :updater, presence: true
  validates :video, presence: true

  belongs_to :video, inverse_of: :submissions

  has_many :sessions, class_name: Course::Video::Session.name,
                      inverse_of: :submission, dependent: :destroy
  has_many :events, through: :sessions, class_name: Course::Video::Event.name
  has_one :statistic, class_name: Course::Video::Submission::Statistic.name, dependent: :destroy,
                      foreign_key: :submission_id, inverse_of: :submission, autosave: true

  # @!method self.ordered_by_date
  #   Orders the submissions by date of creation. This defaults to reverse chronological order
  #   (newest submission first).
  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  # @!method self.by_user(user)
  #   Finds all the submissions by the given user.
  #   @param [User] user The user to filter submissions by
  scope :by_user, ->(user) { where(creator: user) }

  # Finds a submission under the same video and and by the same user
  def existing_submission
    return nil unless @existing_submission || (video.present? && creator.present?)
    @existing_submission ||=
      Course::Video::Submission.find_by(video_id: video.id, creator_id: creator.id)
  end

  # Recompute and update submission's watch statistic.
  # Triggered from session controller when session closes. Since only video submissions
  # belonging to course students have sessions, submission statistic is only created for
  # course students.
  def update_statistic
    frequency_array = watch_frequency
    coverage = (100 * (frequency_array.count { |x| x > 0 }) / (video.duration + 1)).round
    build_statistic(watch_freq: frequency_array, percent_watched: coverage).upsert
  end

  private

  # Returns a scope for all events in this submission.
  # Used for WatchStatisticsConcern
  def relevant_events_scope
    events
  end

  # Validate that the submission creator is the same user as the course_user in the associated
  # experience_points_record.
  def validate_consistent_user
    return if course_user && course_user.user == creator
    errors.add(:experience_points_record, :inconsistent_user)
  end

  # Validate that the submission creator does not have an existing submission for this assessment.
  def validate_unique_submission
    return unless existing_submission
    errors.clear
    errors[:base] << I18n.t('activerecord.errors.models.course/video/submission.'\
                            'submission_already_exists')
  end
end
