json.allowAttachment question.allow_attachment? unless question.hide_text?
json.comprehension question.comprehension_question?
json.autogradable question.auto_gradable?
json.maximumGrade question.maximum_grade

json.solutions question.solutions.each do |solution|
  json.id solution.id
  json.solutionType solution.solution_type
  # Do not sanitize the solution here to prevent double sanitization.
  # Sanitization will be handled automatically by the React frontend.
  json.solution solution.solution
  json.grade solution.grade
end if can_grade && question.auto_gradable? && !question.comprehension_question?

json.groups question.groups.each do |group|
  json.id group.id
  json.maximumGroupGrade group.maximum_group_grade

  json.points group.points.each do |point|
    json.id point.id
    json.pointGrade point.point_grade

    json.solutions point.solutions.each do |s|
      json.id s.id
      json.solutionType s.solution_type
      # Do not sanitize the solution here to prevent double sanitization.
      # Sanitization will be handled automatically by the React frontend.
      json.solution s.solution.join(', ')
      json.solutionLemma s.solution_lemma.join(', ')
      json.information s.information
    end
  end
end if can_grade && question.auto_gradable? && question.comprehension_question?
