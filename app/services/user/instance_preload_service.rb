# frozen_string_literal: true

# Preloads the instances for given users.
class User::InstancePreloadService
  def initialize(user_ids)
    ActsAsTenant.without_tenant do
      @instances = Instance.select('instances.*, instance_users.user_id AS user_id').joins(:instance_users).
                   where(instance_users: { user_id: user_ids }).order_by_name.group_by(&:user_id)
    end
  end

  # @return [Array<Instance>|nil] The instances, if found, else nil
  def instances_for(user_id)
    @instances[user_id]
  end
end
