json.(survey, :id, :title, :description, :start_at, :end_at, :base_exp, :published)
json.canCreateQuestion can?(:create, survey.questions.build)
json.canUpdate can?(:update, survey)
json.canDelete can?(:destroy, survey)
