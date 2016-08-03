# frozen_string_literal: true
module System::Admin::SystemAdminAbilityComponent
  include AbilityHost::Component

  def define_permissions
    do_not_allow_system_admin_manage_default_instance

    super
  end

  private

  def do_not_allow_system_admin_manage_default_instance
    cannot :update, Instance, id: Instance::DEFAULT_INSTANCE_ID
    cannot :destroy, Instance, id: Instance::DEFAULT_INSTANCE_ID
  end
end
