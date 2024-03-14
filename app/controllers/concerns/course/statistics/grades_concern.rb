# frozen_string_literal: true
module Course::Statistics::GradesConcern
  include Course::Statistics::StatisticsConcern

  private

  def grade_statistics_hash
    grades_hash = @submissions.to_a
                              .reject { |submission| submission["workflow_state"] == "attempting" }
                              .map { |submission| [submission["assessment_id"], submission["grade"].to_f] }
                              .group_by { |assessment_id, grade| assessment_id }
                              .transform_values { |pairs| pairs.map { |_, grade| grade } }

    average_and_stdev_each_assessment(grades_hash)
  end
end