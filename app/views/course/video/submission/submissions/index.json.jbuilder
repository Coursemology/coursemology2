# frozen_string_literal: true

submissions = @submissions.to_h { |s| [s.course_user, s] }

json.videoTitle @video.title

json.myStudentSubmissions @my_students do |my_student|
  submission = submissions[my_student]
  json.courseUserId my_student.id
  json.courseUserName my_student.name
  if submission
    json.id submission.id
    json.createdAt submission.created_at
    json.percentWatched submission.statistic&.percent_watched
  end
end

normal_students = @course_students.without_phantom_users

json.studentSubmissions normal_students do |normal_student|
  submission = submissions[normal_student]
  json.courseUserId normal_student.id
  json.courseUserName normal_student.name
  if submission
    json.id submission.id
    json.createdAt submission.created_at
    json.percentWatched submission.statistic&.percent_watched
  end
end

phantom_students = @course_students - normal_students

json.phantomStudentSubmissions phantom_students do |phantom_student|
  submission = submissions[phantom_student]
  json.courseUserId phantom_student.id
  json.courseUserName phantom_student.name
  if submission
    json.id submission.id
    json.createdAt submission.created_at
    json.percentWatched submission.statistic&.percent_watched
  end
end
