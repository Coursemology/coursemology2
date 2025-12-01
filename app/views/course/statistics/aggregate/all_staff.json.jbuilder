# frozen_string_literal: true
graded_staff = @staff.reject { |staff| staff.published_submissions.empty? }

json.staff graded_staff do |staff|
  json.id staff.id
  json.name staff.name
  json.numGraded staff.published_submissions.size
  json.numStudents staff.my_students.count
  json.averageMarkingTime staff.average_marking_time
  json.stddev staff.marking_time_stddev
end
