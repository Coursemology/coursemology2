# frozen_string_literal: true
json.solutions question.solutions do |sol|
  json.id sol.id
  json.solutionType sol.solution_type
  json.solution sol.solution
  json.grade sol.grade
  json.explanation sol.explanation
end
