json.(survey, :id, :title, :description, :start_at, :end_at, :base_exp)
json.canUpdate can?(:update, survey)
json.canDelete can?(:destroy, survey)
