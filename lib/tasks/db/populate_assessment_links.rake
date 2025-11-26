# frozen_string_literal: true

namespace :db do
  task populate_assessment_links: :environment do
    ActsAsTenant.without_tenant do
      # Now create links between assessments with the same linkable_tree_id and instance_id
      puts 'Creating links between assessments with the same root_id and instance_id...'

      # Fetch all assessments grouped by linkable_tree_id and instance_id
      sql = <<~SQL.squish
        SELECT
          a.id AS assessment_id,
          a.linkable_tree_id,
          c.instance_id
        FROM
          course_assessments a
          INNER JOIN course_assessment_tabs t ON t.id = a.tab_id
          INNER JOIN course_assessment_categories cc ON cc.id = t.category_id
          INNER JOIN courses c ON c.id = cc.course_id
        WHERE
          a.linkable_tree_id IS NOT NULL
        ORDER BY
          a.linkable_tree_id, c.instance_id, a.id;
      SQL

      # Group assessments by (linkable_tree_id, instance_id)
      grouped_assessments = {}
      ActiveRecord::Base.connection.execute(sql).each do |row|
        key = [row['linkable_tree_id'], row['instance_id']]
        grouped_assessments[key] ||= []
        grouped_assessments[key] << row['assessment_id']
      end

      puts "Found #{grouped_assessments.size} unique (root_id, instance_id) groups"

      # Clear existing links
      Course::Assessment::Link.delete_all

      created_links = 0
      # Create links for each group with 2+ assessments
      grouped_assessments.each do |(_root_id, _instance_id), assessment_ids|
        next if assessment_ids.size < 2

        all_links = []
        # For each assessment, create links to all other assessments in the group
        assessment_ids.each do |assessment_id|
          other_assessments = assessment_ids - [assessment_id]
          other_assessments.each do |linked_id|
            all_links << { assessment_id: assessment_id, linked_assessment_id: linked_id }
          end
        end

        # Bulk insert all links
        if all_links.any?
          Course::Assessment::Link.insert_all(all_links)
          created_links += all_links.size
        else
          puts 'No links to create'
        end
      end

      puts "Created #{created_links} links between assessments"
    end
  end
end
