# frozen_string_literal: true

# Info for rendering the tabs
json.tabs do
  if current_course_user&.teaching_staff? || can?(:manage, current_course)
    my_students_exist = !current_course_user&.my_students&.empty?
    json.myStudentExist my_students_exist
    json.myStudentUnreadCount my_students_unread_count if my_students_exist
    json.allStaffUnreadCount all_staff_unread_count
  elsif current_course_user&.student?
    json.allStudentUnreadCount all_student_unread_count
  end
end
