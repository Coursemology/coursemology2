module System::Admin::SystemAdminAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      do_not_allow_system_admin_manage_default_instance
    end

    super
  end

  private

  def do_not_allow_system_admin_manage_default_instance
    cannot :manage, Instance, host: Instance::DEFAULT_HOST_NAME
  end
end
