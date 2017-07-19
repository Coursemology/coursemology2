class Course::AnnouncementNotifier < Notifier::Base
  # To be called when an announcement is made.
  def new_announcement(user, announcement)
    email_enabled = Course::Settings::AnnouncementsComponent.
                    email_enabled?(announcement.course, :new_announcement)

    create_activity(actor: user, object: announcement, event: :new).
      notify(announcement.course, :email).
      save if email_enabled
  end
end
