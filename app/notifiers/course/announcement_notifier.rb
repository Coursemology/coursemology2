class Course::AnnouncementNotifier < Notifier::Base
  # To be called when an announcement is made.
  def new_announcement(user, announcement)
    create_activity(actor: user, object: announcement, event: :new).
      notify(announcement.course, :email).
      save
  end
end
