# frozen_string_literal: true
module System::Admin::InstanceAnnouncementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_instance_users_show_announcements
      allow_instance_admin_manage_announcements
    end

    super
  end

  private

  def allow_instance_users_show_announcements
    can :read, Instance::Announcement,
        instance_all_instance_users_hash.reverse_merge(already_started_hash)
  end

  def allow_instance_admin_manage_announcements
    can :manage, Instance::Announcement, instance_instance_user_hash(InstanceUser.roles[:administrator])
  end
end
