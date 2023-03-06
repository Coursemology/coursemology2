# frozen_string_literal: true

class Course::Level::PreloadService
    # Preloads levels of all course users in a course.
    #
    # @param Integer course_id
    # @return [Hash{course_user_id => Array<Integer>}] Hash that maps course user id to the level
    def initialize(course_id)
      @course_user_levels = [CourseUser.where(course_id: course_id).pluck(:course_user_id), 0].to_h
      compute_course_user_levels
    end
  
    # Finds the course level for the given course user.
    #
    # @param [Integer] course_user_id
    # @return [Array<CourseUser>|nil] The course user level, if found, else nil
    def course_level_for(course_user_id)
      @course_user_levels[course_user_id]
    end

    private

    def compute_course_user_levels
    end
  end
  