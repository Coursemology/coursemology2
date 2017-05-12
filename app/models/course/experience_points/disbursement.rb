# frozen_string_literal: true
class Course::ExperiencePoints::Disbursement
  include ActiveModel::Model
  include ActiveModel::Validations

  # @!attribute [rw] reason
  #   This reason for the disbursement.
  #   This will become the reason for each experience points record awarded.
  #   @return [String]
  attr_accessor :reason

  # @!attribute [rw] course
  #   The course that this disbursement is for. This attribute is read during authorization.
  #   @return [Course]
  attr_accessor :course

  # @!attribute [rw] group_id
  #   ID of the group that this disbursement is for. nil is returned if no group is specified.
  #   @return [Integer|nil]
  attr_accessor :group_id

  validates :reason, presence: true

  # Returns experience points records for the disbursement. It creates empty records if no records
  # are present.
  #
  # @return [Array<Course::ExperiencePointsRecords>] The points records for this disbursement.
  def experience_points_records
    @experience_points_records ||= filtered_students.order_alphabetically.map do |student|
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

  # Returns the group that this disbursement is for if a valid group is specified, otherwise
  # return nil.
  #
  # @return [Course::Group|nil] The group that this disbursement is for
  def group
    @group ||= group_id && course.groups.find_by(id: group_id)
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
      attibutes[:points_awarded].to_i >= 0
  end

  # Returns a list of students filtered by group if one is specified, otherwise
  # it returns all students in the course.
  #
  # @return [Array<CourseUser>] The list of potential students awardees
  def filtered_students
    group_id ? students_from_group(group_id) : course.course_users.student
  end

  # Returns all normal course_users from the specified group.
  #
  # @param [Integer] group_id The id of the group
  # @return [Array<CourseUser>] The students in the group
  def students_from_group(group_id)
    course.course_users.joins(:group_users).where('course_group_users.group_id = ?', group_id).
      merge(Course::GroupUser.normal)
  end
end
