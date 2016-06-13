class Course::AssessmentNotifier < Notifier::Base
  # To be called when user attempted an assessment.
  def assessment_attempted(user, assessment)
    create_activity(actor: user, object: assessment, event: :attempted).
      notify(assessment.tab.category.course, :feed).
      save
  end
end
