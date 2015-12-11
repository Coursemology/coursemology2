module System::Admin::SystemAnnouncementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_system_users_show_announcements
    end

    super
  end

  private

  def allow_system_users_show_announcements
    can :read, System::Announcement, already_started_hash
  end
end
