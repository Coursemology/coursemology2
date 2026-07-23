# frozen_string_literal: true
json.submission do
  json.partial! 'course/assessment/submission/submissions/attempt', attempt: preview_attempt, assessment: assessment,
                                                                     can_grade: can_grade, can_update: can_update

  json.submitter do
    json.name display_user(preview_attempt.creator)
    json.id nil
  end

  json.bonusEndAt nil
  json.dueAt nil

  if ['graded', 'published'].include? preview_attempt.workflow_state
    json.gradedAt preview_attempt.published_at&.iso8601
    if preview_attempt.workflow_state == 'published'
      json.grader do
        json.name display_user(preview_attempt.creator)
        json.id nil
      end
    end
    json.grade preview_attempt.grade.to_f
  end

  json.late nil

  json.basePoints assessment.base_exp
  json.bonusPoints assessment.time_bonus_exp
  json.pointsAwarded preview_attempt.current_points_awarded
end
