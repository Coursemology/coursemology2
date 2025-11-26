# frozen_string_literal: true

namespace :db do
  task populate_assessment_linkable_tree_id: :environment do
    ActsAsTenant.without_tenant do
      puts 'Computing root_id for all assessments using union-find...'

      # Fetch all parent relationships in a single query
      parent_map = {}

      sql = <<~SQL.squish
        WITH existing_assessments AS (
          SELECT
            a.id
          FROM
            course_assessments a
            INNER JOIN course_assessment_tabs t ON t.id=a.tab_id
            INNER JOIN course_assessment_categories cc ON cc.id=t.category_id
            INNER JOIN courses c ON c.id=cc.course_id
        )
        SELECT dta.assessment_id, dt.source_id
          FROM duplication_traceable_assessments dta
          INNER JOIN duplication_traceables dt ON dt.actable_id = dta.id
          INNER JOIN existing_assessments exa1 ON exa1.id=dta.assessment_id
          INNER JOIN existing_assessments exa2 ON exa2.id=dt.source_id
          WHERE dt.actable_type = 'DuplicationTraceable::Assessment'
            AND dt.source_id IS NOT NULL;
      SQL

      ActiveRecord::Base.connection.execute(sql).each do |row|
        parent_map[row['assessment_id']] = row['source_id']
      end

      puts "Loaded #{parent_map.size} parent relationships"

      # Union-find with path compression
      # Parent hash: maps each assessment to its parent
      # Keys not explicitly listed map to themselves
      parent = {}

      # Update with known parent relationships
      parent_map.each { |child, p| parent[child] = p }

      # Find function with path compression
      find_root = lambda do |x|
        if parent[x].nil?
          x
        else
          parent[x] = find_root.call(parent[x]) # Path compression
          parent[x]
        end
      end

      # Compute root for all assessments and update
      total_assessments = Course::Assessment.count
      Course::Assessment.find_each do |assessment|
        assessment.update_column(:linkable_tree_id, find_root.call(assessment.id))
      end

      puts "Populated linkable_tree_id for #{total_assessments} assessments"
    end
  end
end
