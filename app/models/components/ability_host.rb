class AbilityHost
  include Componentize

  # Helpers for defining abilities associated with a course user.
  module CourseHelpers
    protected

    # Creates a hash which allows referencing a set of course users.
    #
    # @param [Array<Symbol>] roles The roles {CourseUser::Roles} which should be referenced by this
    #   rule.
    # @return [Hash] This hash is relative to a Course.
    def course_user_hash(*roles)
      course_users = { user_id: user.id,
                       workflow_state: 'approved' }
      unless roles.empty?
        # Remove the map when Rails 5 is released.
        course_users[:role] = roles.map do |role|
          [CourseUser.roles[role], role.to_s]
        end.flatten!
      end

      { course_users: course_users }
    end

    # @return [Hash] The hash is relative to a component which has a +belongs_to+ association with
    #   a Course.
    def course_course_user_hash(*roles)
      { course: course_user_hash(*roles) }
    end

    alias_method :course_all_course_users_hash, :course_course_user_hash

    # @return [Hash] The hash is relative to a component which has a +belongs_to+ association with
    #   a Course.
    def course_staff_hash
      course_course_user_hash(*CourseUser::STAFF_ROLES.to_a)
    end

    # @return [Hash] The hash is relative to a component which has a +belongs_to+ association with
    #   a Course.
    def course_managers_hash
      course_course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
    end
  end

  # Open the Componentize Base Component.
  const_get(:Component).module_eval do
    include CourseHelpers
  end

  # Eager load all the components declared.
  eager_load_components(__dir__)
end
