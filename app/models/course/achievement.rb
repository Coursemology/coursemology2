# frozen_string_literal: true
class Course::Achievement < ApplicationRecord
  include Course::SanitizeDescriptionConcern
  acts_as_paranoid
  acts_as_conditional
  mount_uploader :badge, ImageUploader
  has_many_attachments on: :description

  after_initialize :set_defaults, if: :new_record?

  validates :title, length: { maximum: 255 }, presence: true
  validates :weight, numericality: { only_integer: true }, presence: true
  validates :published, inclusion: { in: [true, false] }
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true

  belongs_to :course, inverse_of: :achievements
  has_many :course_user_achievements, class_name: 'Course::UserAchievement',
                                      inverse_of: :achievement, dependent: :destroy
  has_many :achievement_conditions, class_name: 'Course::Condition::Achievement',
                                    inverse_of: :achievement, dependent: :destroy
  # Due to the through relationship, destroy dependent had to be added for course users in order for
  # UserAchievement's destroy callbacks to be called, However, this destroy dependent will not
  # actually remove the course users when the Achievement object is destroyed.
  # http://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html
  has_many :course_users, through: :course_user_achievements, class_name: 'CourseUser',
                          dependent: :destroy

  default_scope { order(weight: :asc) }

  def to_partial_path
    'course/achievement/achievements/achievement'
  end

  # Set default values
  def set_defaults
    self.weight ||= 10
  end

  # Returns if achievement is manually or automatically awarded.
  #
  # @return [Boolean] Whether the achievement is manually awarded.
  def manually_awarded?
    # TODO: Correct call should be conditions.empty?, but that results in an
    # exception due to polymorphism. To investigate.
    specific_conditions.empty?
  end

  # @override ConditionalInstanceMethods#permitted_for!
  def permitted_for!(course_user)
    return if conditions.empty?

    course_users << course_user unless course_users.exists?(course_user.id)
  end

  # @override ConditionalInstanceMethods#precluded_for!
  def precluded_for!(course_user)
    course_users.delete(course_user) if course_users.exists?(course_user.id)
  end

  # @override ConditionalInstanceMethods#satisfiable?
  def satisfiable?
    published?
  end

  def initialize_duplicate(duplicator, other)
    duplicate_badge(other)
    self.course = duplicator.options[:destination_course]
    self.published = false if duplicator.options[:unpublish_all]
    duplicate_conditions(duplicator, other)
    achievement_conditions << other.achievement_conditions.
                              select { |condition| duplicator.duplicated?(condition.conditional) }.
                              map { |condition| duplicator.duplicate(condition) }
  end

  def duplicate_badge(other)
    self.badge = nil if other.badge_url && !badge.duplicate_from(other.badge)
  end
end
