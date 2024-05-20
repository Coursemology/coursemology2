# frozen_string_literal: true
class Course::Condition::Video < ApplicationRecord
  include ActiveSupport::NumberHelper
  include DuplicationStateTrackingConcern
  acts_as_condition

  # Trigger for evaluating the satisfiability of conditionals for a course user
  Course::Video::Submission.after_save do |submission|
    Course::Condition::Video.on_dependent_status_change(submission)
  end

  validate :validate_video_condition, if: :video_id_changed?
  validates :video, presence: true
  validates :minimum_watch_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 },
                                       allow_nil: true

  belongs_to :video, class_name: 'Course::Video', inverse_of: :video_conditions

  default_scope { includes(:video) }

  alias_method :dependent_object, :video

  def title
    if minimum_watch_percentage
      minimum_watch_percentage_display = number_to_percentage(minimum_watch_percentage,
                                                              precision: 2,
                                                              strip_insignificant_zeros: true)
      self.class.human_attribute_name('title.minimum_watch_percentage',
                                      video_title: video.title,
                                      minimum_watch_percentage: minimum_watch_percentage_display)
    else
      self.class.human_attribute_name('title.complete',
                                      video_title: video.title)
    end
  end

  def satisfied_by?(course_user)
    # Unpublished videos are considered not satisfied
    return false unless video.published?

    user = course_user.user

    if minimum_watch_percentage
      watched_video_with_minimum_watch_percentage_exists?(user, minimum_watch_percentage)
    else
      watched_video_exists?(user)
    end
  end

  # Class that the condition depends on
  def self.dependent_class
    'Course::Video'
  end

  def self.on_dependent_status_change(submission)
    submission.execute_after_commit { evaluate_conditional_for(submission.course_user) }
  end

  def initialize_duplicate(duplicator, other)
    self.video = duplicator.duplicate(other.video)
    self.conditional_type = other.conditional_type
    self.conditional = duplicator.duplicate(other.conditional)

    case duplicator.mode
    when :course
      self.course = duplicator.duplicate(other.course)
    when :object
      self.course = duplicator.options[:destination_course]
    end

    set_duplication_flag
  end

  private

  def watched_video_exists?(user)
    video.submissions.by_user(user).exists?
  end

  def watched_video_with_minimum_watch_percentage_exists?(user, minimum_watch_percentage)
    video.submissions.by_user(user).any? do |submission|
      submission.statistic.percent_watched >= minimum_watch_percentage
    end
  end

  def validate_video_condition
    validate_references_self
    validate_unique_dependency unless duplicating?
    validate_acyclic_dependency
  end

  def validate_references_self
    return unless video == conditional

    errors.add(:video, :references_self)
  end

  def validate_unique_dependency
    return unless required_videos_for(conditional).include?(video)

    errors.add(:video, :unique_dependency)
  end

  def validate_acyclic_dependency
    return unless cyclic?

    errors.add(:video, :cyclic_dependency)
  end

  # Given a conditional object, returns all videos that it requires.
  #
  # @param [#conditions] conditional The object that is declared as acts_as_conditional and for
  #   which returned videos are required.
  # @return [Array<Course::Video>]
  def required_videos_for(conditional)
    # Course::Condition::Video.
    #   joins { condition.conditional(Course::Video) }.
    #   where.has { condition.conditional.id == video.id }.
    #   map(&:video)

    # Workaround, pending the squeel bugfix (activerecord-hackery/squeel#390) that will allow
    # allow the above query to work without #reload
    Course::Video.joins(<<-SQL)
      INNER JOIN
        (SELECT cca.video_id
          FROM course_condition_videos cca INNER JOIN course_conditions cc
            ON cc.actable_type = 'Course::Condition::Video' AND cc.actable_id = cca.id
            WHERE cc.conditional_id = #{conditional.id}
              AND cc.conditional_type = #{ActiveRecord::Base.connection.quote(conditional.class.name)}
        ) ids
      ON ids.video_id = course_videos.id
    SQL
  end
end
