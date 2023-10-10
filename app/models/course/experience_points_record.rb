# frozen_string_literal: true
class Course::ExperiencePointsRecord < ApplicationRecord
  include Generic::CollectionConcern
  actable optional: true

  before_save :send_notification, if: :reached_new_level?
  before_create :set_awarded_attributes, if: :manually_awarded?

  validates :reason, presence: true, if: :manually_awarded?

  validates :actable_type, length: { maximum: 255 }, allow_nil: true
  validates :points_awarded, numericality: { only_integer: true, greater_than_or_equal_to: -2_147_483_648,
                                             less_than: 2_147_483_648 }, allow_nil: true
  validates :reason, length: { maximum: 255 }, allow_nil: true
  validates :draft_points_awarded, numericality: { only_integer: true, greater_than_or_equal_to: -2_147_483_648,
                                                   less_than: 2_147_483_648 }, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course_user, presence: true
  validates :actable_type, uniqueness: { scope: [:actable_id], allow_nil: true,
                                         if: -> { actable_id? && actable_type_changed? } }
  validates :actable_id, uniqueness: { scope: [:actable_type], allow_nil: true,
                                       if: -> { actable_type? && actable_id_changed? } }
  validate :validate_limit_exp_points_on_association

  belongs_to :course_user, inverse_of: :experience_points_records
  belongs_to :awarder, class_name: User.name, inverse_of: nil, optional: true

  scope :active, -> { where.not(points_awarded: nil) }

  # Checks if the current record is active, i.e. it has been granted by a course staff.
  #
  # This is necessary for records to be created but not graded, such as that of assessments.
  #
  # @return [Boolean]
  def active?
    points_awarded.present?
  end

  # Checks if the given record is a manually-awarded experience points record.
  #
  # @return [Boolean]
  def manually_awarded?
    actable_type.nil? && actable.nil?
  end

  private

  def send_notification
    return unless course_user.student? && course_user.course.gamified?

    Course::LevelNotifier.level_reached(course_user.user, level_after_update)
  end

  # Test if the course_user will reach a new level after current update.
  def reached_new_level?
    return false unless points_awarded && points_awarded_changed?

    level_after_update.level_number > level_before_update.level_number
  end

  def level_before_update
    current_exp = course_user.experience_points
    course_user.course.level_for(current_exp)
  end

  def level_after_update
    # Since we are in the before_save callback, exp changes are not saved yet.
    exp_changed = points_awarded - (points_awarded_was || 0)
    current_exp = course_user.experience_points
    course_user.course.level_for(current_exp + exp_changed)
  end

  def set_awarded_attributes
    self.awarded_at ||= Time.zone.now
    self.awarder ||= User.stamper
  end

  def validate_limit_exp_points_on_association
    return if manually_awarded?

    case specific.actable
    when Course::Assessment::Submission
      return unless specific.assessment

      validate_submission_points
    when Course::Survey::Response
      return unless specific.survey

      validate_survey_points
    end
  end

  def validate_submission_points
    submission = specific
    assessment = submission.assessment

    max_exp_points = (assessment.base_exp || 0) + (assessment.time_bonus_exp || 0)
    add_points_error('assignment', max_exp_points) if points_awarded && points_awarded > max_exp_points
    add_negative_points_error('assignment') if points_awarded && points_awarded < 0
  end

  def validate_survey_points
    response = specific
    survey = response.survey

    max_exp_points = (survey.base_exp || 0) + (survey.time_bonus_exp || 0)
    add_points_error('survey', max_exp_points) if points_awarded && points_awarded > max_exp_points
    add_negative_points_error('assignment') if points_awarded && points_awarded < 0
  end

  def add_points_error(type, max_exp_points)
    errors.add(:base, "Points awarded cannot exceed the upper bound for this #{type}, which is #{max_exp_points}")
  end

  def add_negative_points_error(type)
    errors.add(:base, "Points awarded for this #{type} cannot be negative")
  end
end
