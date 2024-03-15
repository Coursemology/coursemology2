# frozen_string_literal: true
module Course::Statistics::TimesConcern
  include Course::Statistics::StatisticsConcern

  private

  def get_time_taken(submission)
    created_at = submission['created_at'].to_i
    submitted_at = submission['submitted_at'].to_i

    submitted_at - created_at
  end

  def duration_statistics_hash
    duration_hash = @all_submissions_info.
                    to_a.
                    reject { |s| s['workflow_state'] == 'attempting' }.
                    map { |s| [s['assessment_id'], get_time_taken(s)] }.
                    group_by { |assessment_id, _| assessment_id }.
                    transform_values { |pairs| pairs.map { |_, duration| duration } }

    average_and_stdev_each_assessment(duration_hash)
  end
end
