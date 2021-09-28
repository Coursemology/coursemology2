# frozen_string_literal: true
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
      course_users = { user_id: user.id }
      course_users[:role] = roles unless roles.empty?

      { course_users: course_users }
    end

    # @return [Hash] Hash relative to a component with a +has_many+ association with CourseUser.
    def staff_hash
      course_user_hash(*CourseUser::STAFF_ROLES.to_a)
    end

    # @return [Hash] Hash relative to a component with a +has_many+ association with CourseUser.
    def teaching_staff_hash
      course_user_hash(*CourseUser::TEACHING_STAFF_ROLES.to_a)
    end

    # @return [Hash] Hash relative to a component with a +has_many+ association with CourseUser.
    def managers_hash
      course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
    end

    # @return [Hash] Hash is relative to a component with a +belongs_to+ association with a Course.
    def course_course_user_hash(*roles)
      { course: course_user_hash(*roles) }
    end

    alias_method :course_all_course_users_hash, :course_course_user_hash

    # @return [Hash] Hash is relative to a component with a +belongs_to+ association with a Course.
    def course_staff_hash
      course_course_user_hash(*CourseUser::STAFF_ROLES.to_a)
    end

    # @return [Hash] Hash is relative to a component with a +belongs_to+ association with a Course.
    def course_teaching_staff_hash
      course_course_user_hash(*CourseUser::TEACHING_STAFF_ROLES.to_a)
    end

    # @return [Hash] Hash is relative to a component with a +belongs_to+ association with a Course.
    def course_teaching_assistants_hash
      course_course_user_hash(:teaching_assistant)
    end

    # @return [Hash] Hash is relative to a component with a +belongs_to+ association with a Course.
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
      instance_users[:role] = roles unless roles.empty?

      { instance_users: instance_users }
    end

    # @return [Hash] The hash is relative to a component which has a +belongs_to+ association with
    #   an Instance.
    def instance_instance_user_hash(*roles)
      { instance: instance_user_hash(*roles) }
    end

    alias_method :instance_all_instance_users_hash, :instance_instance_user_hash
  end

  module TimeBoundedHelpers
    protected

    # Returns an array of conditions which will return currently valid rows when ORed together in a
    # database query. Reverse-merge each of these hashes with your conditions to obtain the set of
    # currently valid rows in the table.
    #
    # @return [Array<Hash>] An array of hash conditions indicating the currently valid rows.
    def currently_valid_hashes
      [
        {
          start_at: (Time.min..Time.zone.now),
          end_at: nil
        },
        {
          start_at: (Time.min..Time.zone.now),
          end_at: (Time.zone.now..Time.max)
        }
      ]
    end

    # Returns a condition which will return started rows(start_at before current time) when
    # ORed together in a database query. Reverse-merge this with your conditions to obtain the
    # set of already started rows in the table.
    #
    # @return [Hash] The hash condition.
    def already_started_hash
      {
        start_at: (Time.min..Time.zone.now)
      }
    end
  end

  # Open the Componentize Base Component.
  const_get(:Component).module_eval do
    include InstanceHelpers
    include CourseHelpers
    include TimeBoundedHelpers
  end

  # Eager load all the components declared.
  eager_load_components(__dir__)
end
