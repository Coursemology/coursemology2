can_grade = can?(:grade, @submission)
can_update = can?(:update, @submission)

json.canGrade can_grade
json.canUpdate can_update

json.assessment do
  json.(@assessment, :title, :description, :published, :autograded, :skippable,
    :tabbed_view, :password)
  json.delayedGradePublication @assessment.delayed_grade_publication
  json.passwordProtected @assessment.password_protected?
  json.tabbedView @assessment.tabbed_view
end

json.partial! 'submission', submission: @submission, can_grade: can_grade
json.partial! 'submission_question', submission: @submission
