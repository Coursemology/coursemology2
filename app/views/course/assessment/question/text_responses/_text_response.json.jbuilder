json.allowAttachment question.allow_attachment? unless question.hide_text?
json.autogradable question.auto_gradable?

json.solutions question.solutions.each do |solution|
  json.solutionType solution.solution_type
  # Do not sanitize the solution here to prevent double sanitization.
  # Sanitization will be handled automatically by the React frontend.
  json.solution solution.solution
  json.grade solution.grade
end if can_grade && question.auto_gradable?
