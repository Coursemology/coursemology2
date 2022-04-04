graded_staff = @staff.reject { |staff| staff.published_submissions.empty? }

json.staff graded_staff do |staff|
  json.name staff.name
  json.numGraded staff.published_submissions.size
  json.numStudents staff.my_students.count
  json.averageMarkingTime seconds_to_str(staff.average_marking_time)
  json.stddev seconds_to_str(staff.marking_time_stddev)
end
