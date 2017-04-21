@can_grade = can?(:grade, @submission)
@can_update = can?(:update, @submission)

json.canGrade @can_grade
json.canUpdate @can_update

json.progress do
  json.partial! 'progress'
end

json.assessment do
  json.(@assessment, :title, :description, :published, :autograded, :skippable,
    :tabbed_view, :password, :delayed_grade_publication)
  json.password_protected @assessment.password_protected?
end

json.partial! 'submission'
