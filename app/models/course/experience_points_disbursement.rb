# frozen_string_literal: true
class Course::ExperiencePointsDisbursement
  include ActiveModel::Model
  include ActiveModel::Validations

  # @!attribute [rw] reason
  #   This reason for the disbursement.
  #   This will become the reason for each experience points record awarded.
  #   @return [String]
  attr_accessor :reason

  # @!attribute [rw] course
  #   The course that this disbursement is for.
  #   @return [Course]
  attr_accessor :course

  # @!attribute [r] experience_points_records
  #   Experience points records that will potentially be created.
  #   @return [Array<Course::ExperiencePointsRecords>]
  attr_reader :experience_points_records

  validates :reason, presence: true

  # Given a course, builds an empty experience points record for each of its approved students.
  #
  # @return [Array<Course::ExperiencePointsRecords>] The newly built experience points records
  def build(current_course)
    @course = current_course
    @experience_points_records = course.course_users.students.with_approved_state.map do |student|
      student.experience_points_records.build
    end
  end

  # Processes the experience points records attributes hash, instantiating new experience points
  # records for attributes hashes that represents a valid award.
  #
  # @param [Hash] attributes Experience points records attributes hash
  # @return [Hash] Experience points records attributes hash
  def experience_points_records_attributes=(attributes)
    valid_attributes = attributes.values.select(&method(:valid_points_record_attributes?))
    @experience_points_records = valid_attributes.map do |hash|
      hash[:reason] = reason
      Course::ExperiencePointsRecord.new(hash)
    end
    attributes
  end

  # Saves the newly built experience points records.
  #
  # @return [Boolean] True if bulk saving was successful
  def save
    Course::ExperiencePointsRecord.transaction { @experience_points_records.map(&:save!).all? }
  rescue ActiveRecord::RecordInvalid
    false
  end

  private

  # Checks whether an attributes hash represents a valid experience points award.
  #
  # @param [Hash] attributes Experience points record attributes hash
  # @return [Boolean] True if hash represents a valid points award
  def valid_points_record_attributes?(attibutes)
    attibutes[:course_user_id].present? &&
      attibutes[:points_awarded].present? &&
      attibutes[:points_awarded].to_i != 0
  end
end
