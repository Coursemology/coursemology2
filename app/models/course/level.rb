# frozen_string_literal: true
class Course::Level < ApplicationRecord
  include Course::ModelComponentHost::Component
  validates :experience_points_threshold, numericality: { greater_than_or_equal_to: 0 }

  belongs_to :course, inverse_of: :levels

  # By default, levels should be returned with their level_number,
  # and arranged in ascending order by experience points threshold.
  default_scope { all.calculated(:level_number).order(:experience_points_threshold) }

  # Make use of RANK(), a postgres window function to generate level numbers.
  # Since rank starts from 1 and Course::Levels start from 0, 1 is deducted from rank.
  calculated :level_number, (lambda do
    <<-SQL
      SELECT cln.level_number
      FROM (
        SELECT id, (-1 + rank() OVER (
                     PARTITION BY cl.course_id ORDER BY cl.experience_points_threshold ASC)
                   ) AS level_number
        FROM course_levels cl
        WHERE cl.course_id = course_levels.course_id
      ) AS cln
      WHERE cln.id = course_levels.id
    SQL
  end)

  # Build default level when a new course is initalised. The default level has
  # 0 experience_points_threshold.
  def self.after_course_initialize(course)
    return if course.persisted? || course.default_level?

    course.levels.build(experience_points_threshold: 0)
  end

  # Returns true if level is a default level.
  # Default level is currently implemented as a level with 0 threshold
  #
  # @return [Boolean]
  def default_level?
    experience_points_threshold == 0
  end

  # Returns the next higher level in the course
  # nil is returned if current level is the highest level
  #
  # @return [Course::Level] For levels with next level in the course.
  # @return [nil] If current level is the highest in the course.
  def next
    return @next if defined? @next
    @next = course.levels.offset(level_number + 1).first
  end

  # Returns the experience_points_threshold of the next level. If current level is highest
  # the current experience_points_threshold will be returned.
  #
  # @return [Integer] The experience_points_threshold of the next level, or threshold of current
  # level if current level is the highest.
  def next_level_threshold
    self.next ? self.next.experience_points_threshold : experience_points_threshold
  end

  def initialize_duplicate(duplicator, _other)
    self.course = duplicator.options[:target_course]
  end
end
