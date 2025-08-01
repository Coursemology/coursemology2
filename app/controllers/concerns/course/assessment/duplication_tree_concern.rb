# frozen_string_literal: true
module Course::Assessment::DuplicationTreeConcern
  extend ActiveSupport::Concern

  # Gets all assessments in the duplicaiton tree containing the given assessment.
  def get_all_assessments_in_duplication_tree(assessment)
    root_assessment = find_assessment_root_in_duplication_tree(assessment)

    assessments = Course.find_by_sql(<<~SQL.squish
      WITH RECURSIVE duplication_tree_assessments AS (
        SELECT dta.assessment_id
        FROM duplication_traceable_assessments dta
        INNER JOIN duplication_traceables dt ON dt.actable_id = dta.id
        WHERE dt.source_id = #{root_assessment.id}

        UNION ALL

        SELECT dta.assessment_id
        FROM duplication_traceable_assessments dta
        INNER JOIN duplication_traceables dt ON dt.actable_id = dta.id
        INNER JOIN duplication_tree_assessments tree ON tree.assessment_id = dt.source_id
      )
      SELECT assessment_id FROM duplication_tree_assessments
    SQL
                                    )
    assessment_ids = assessments.map(&:assessment_id) + [root_assessment.id]
    Course::Assessment.where(id: assessment_ids).includes(:course)
  end

  private

  # Finds the root assessment in the duplication tree by traversing up the parent chain.
  def find_assessment_root_in_duplication_tree(assessment)
    current = assessment
    while current.duplication_traceable.present? && current.duplication_traceable.source_id.present?
      current = current.duplication_traceable.source
    end
    current
  end
end
