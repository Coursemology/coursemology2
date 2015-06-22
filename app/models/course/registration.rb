class Course::Registration
  include ActiveModel::Model
  extend ActiveModel::Naming
  include ActiveModel::Conversion

  # @!attribute [rw] course
  #   The course the registration is for.
  #   @return [Course]
  attr_accessor :course

  # @!attribute [rw] user
  #   The user registering for the course.
  #   @return [User]
  attr_accessor :user

  # @!attribute [rw] code
  #   The registration code specified by the user.
  #   @return [String]
  attr_accessor :code

  # @!attribute [rw] course_user
  #   The course user created from the registration object.
  #   @return [nil|CourseUser]
  attr_accessor :course_user

  def update(params)
    params.each do |key, value|
      send("#{key}=", value)
    end
  end

  def persisted?
    false
  end
end
