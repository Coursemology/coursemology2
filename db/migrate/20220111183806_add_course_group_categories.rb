# frozen_string_literal: true
class AddCourseGroupCategories < ActiveRecord::Migration[6.0]
  def up
    # Create category table
    create_table :course_group_categories do |t|
      t.references :course, null: false, foreign_key: true,
                            index: { name: 'fk__course_group_categories_course_id' }
      t.string :name, null: false, default: ''
      t.text :description

      # For some reason, t.userstamps does not work
      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_group_categories_creator_id' }
      t.references :updator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_group_categories_updator_id' }
      t.timestamps null: false

      t.index [:course_id, :name], unique: true
    end

    # Add category_id column to existing groups table.
    # This column is nullable for now.
    add_reference :course_groups, :category, foreign_key: { to_table: :course_group_categories },
                                             index: { name: 'fk__course_groups_category_id' }

    # For all existing courses with groups, create a category and put all groups under it
    # All following commands will be in SQL, to avoid coupling/dependency with models
    unique_course_ids = ActiveRecord::Base.connection.exec_query(
      'SELECT DISTINCT course_groups.course_id FROM course_groups'
    ).rows.flatten

    unique_course_ids.each do |id|
      category = ActiveRecord::Base.connection.exec_insert(
        "INSERT INTO course_group_categories
                     (course_id,
                      name,
                      creator_id,
                      updator_id,
                      created_at,
                      updated_at)
         VALUES      (#{id},
                      'Default',
                      0,
                      0,
                      '#{Time.zone.now.to_s(:db)}',
                      '#{Time.zone.now.to_s(:db)}')"
         ).rows.flatten
      ActiveRecord::Base.connection.exec_update(
        "UPDATE course_groups
         SET category_id = #{category[0]}
         WHERE course_id = #{id}"
      )
    end

    # Make category_id column non-nullable
    change_column_null :course_groups, :category_id, false

    # Add index on [category_id, group_name]
    add_index :course_groups, [:category_id, :name], unique: true, name: 'index_course_groups_on_category_id_and_name'

    # Remove index on [course_id, group_name], then remove course_id column
    remove_index :course_groups, name: 'index_course_groups_on_course_id_and_name'
    remove_reference :course_groups, :course, index: { name: 'fk__course_groups_course_id' }, foreign_key: true
  end

  # Note that after rolling back, some minute differences can be noticed, such as the
  # course_id column being of type bigint now + shifting to the back of the table.
  def down
    # Add nullable course_id column to course_groups
    add_reference :course_groups, :course, foreign_key: true,
                                           index: { name: 'fk__course_groups_course_id' }

    # Connect all course_groups back to their courses
    group_id_to_course_id_map = ActiveRecord::Base.connection.exec_query(
      'SELECT
        g.id AS id,
        c.course_id AS course_id
      FROM
        course_groups g LEFT JOIN course_group_categories c
      ON
        g.category_id = c.id'
    ).rows.to_h

    group_id_to_course_id_map.each do |group_id, course_id|
      ActiveRecord::Base.connection.exec_update(
        "UPDATE course_groups
         SET course_id = #{course_id}
         WHERE id = #{group_id}"
      )
    end

    # Set course_id column back to non-nullable
    change_column_null :course_groups, :course_id, false

    # Add index on [course_id, group_name]
    add_index :course_groups, [:course_id, :name], unique: true, name: 'index_course_groups_on_course_id_and_name'

    # Remove stuff added, i.e. column and table
    remove_index :course_groups, name: 'index_course_groups_on_category_id_and_name'
    remove_reference :course_groups, :category, index: { name: 'fk__course_groups_category_id' }, foreign_key: { to_table: :course_group_categories }
    drop_table :course_group_categories
  end
end
