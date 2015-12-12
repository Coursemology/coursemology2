module System::Admin::SystemAnnouncementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_users_show_announcements

    super
  end

  private

  def allow_users_show_announcements
    can :read, System::Announcement, already_started_hash
  end
end
