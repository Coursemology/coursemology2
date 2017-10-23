json.announcements @announcements do |announcement| 
  json.title announcement.title
  json.content announcement.content
  json.sticky announcement.sticky
  json.start_at announcement.start_at
  json.end_at announcement.end_at
  json.id announcement.id
  json.creator announcement.creator.name

  json.timePeriodClasses time_period_class(announcement)
  json.unreadClasses unread_class(announcement)
  json.unread announcement.unread?(current_user)

  json.linkToUser course_path(current_course) + user_path(announcement.creator)

  json.formatedDateTime format_datetime(announcement.start_at)
  json.timePeriodMessage time_period_message(announcement)  

  json.canEdit can?(:edit, announcement)
  json.canDelete can?(:delete, announcement)

  json.currentlyActive announcement.currently_active?    

end

json.canCreate can?(:create, Course::Announcement.new(course: current_course))
json.totalPageCount @total_page_count