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
      course_users[:role] = roles.map { |role| CourseUser.roles[role] } if roles.any?

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

  module InstanceHelpers
    protected

    # Creates a hash which allows referencing a set of instance users.
    #
    # @param [Array<Symbol>] roles The roles {InstanceUser::Roles} which should be referenced by
    #   this rule.
    # @return [Hash] This hash is relative to a Instance.
    def instance_user_hash(*roles)
      instance_users = { user_id: user.id }
      instance_users[:role] = roles.map { |role| InstanceUser.roles[role] } if roles.any?

      { instance_users: instance_users }
    end

    # @return [Hash] The hash is relative to a component which has a +belongs_to+ association with
    #   an Instance.
    def instance_instance_user_hash(*roles)
      { instance: instance_user_hash(*roles) }
    end

    alias_method :instance_all_instance_users_hash, :instance_instance_user_hash
  end

  # Open the Componentize Base Component.
  const_get(:Component).module_eval do
    include InstanceHelpers
    include CourseHelpers
  end

  # Eager load all the components declared.
  eager_load_components(__dir__)
end
