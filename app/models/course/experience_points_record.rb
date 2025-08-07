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
  belongs_to :awarder, class_name: 'User', inverse_of: nil, optional: true

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
      submission = specific
      assessment = submission.assessment

      validate_lesson_plan_item_points(assessment)
    when Course::Survey::Response
      response = specific
      survey = response.survey

      validate_lesson_plan_item_points(survey)
    when Course::ScholaisticSubmission
      validate_lesson_plan_item_points(specific.assessment)
    end
  end

  def validate_lesson_plan_item_points(lesson_plan_item_specific)
    max_exp_points = lesson_plan_item_specific.base_exp + lesson_plan_item_specific.time_bonus_exp
    return unless points_awarded && points_awarded < 0

    errors.add(:base, 'Points awarded cannot be negative')
  end
end
