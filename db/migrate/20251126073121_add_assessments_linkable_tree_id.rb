class AddAssessmentsLinkableTreeId < ActiveRecord::Migration[7.2]
  def up
    add_column :course_assessments, :linkable_tree_id, :integer, null: false, default: 0

    Rake::Task['db:populate_assessment_linkable_tree_id'].invoke

    add_index :course_assessments, :linkable_tree_id, name: 'index_course_assessments_on_linkable_tree_id'
  end

  def down
    remove_index :course_assessments, name: 'index_course_assessments_on_linkable_tree_id'
    remove_column :course_assessments, :linkable_tree_id
  end
end
