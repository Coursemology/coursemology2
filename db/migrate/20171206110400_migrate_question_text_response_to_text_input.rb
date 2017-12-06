class MigrateQuestionTextResponseToTextInput < ActiveRecord::Migration[5.0]
  def up
    ActsAsTenant.without_tenant do

      # Change Course::Assessment::Answer::TextResponse `solution` to be a 1-element array
      # containing the original `solution` string.
      Course::Assessment::Question::TextResponseSolution.all.find_each do |trs|
        trs.update_column(:solution, [trs.solution_old])
      end

      remove_column :course_assessment_question_text_response_solutions,
                    :solution_old, :text, null: false


      # For each Course::Assessment::Question::TextResponse, create
      # one TextResponseGroup and one TextResponsePoint,
      # so the associated TextResponseSolution can be
      # nested in a TextResponsePoint (instead of TextResponse).
      #
      # Previous:
      # TextResponse -> TextResponseSolution
      #
      # Now:
      # TextResponse -> TextResponseGroup -> TextResponsePoint -> TextResponseSolution
      Course::Assessment::Question::TextResponse.all.find_each do |tr|

        Course::Assessment::Question::TextResponseGroup.create(
          { question: tr, maximum_group_grade: tr.acting_as.maximum_grade }
        ) do |trg|
          trg.save!
          Course::Assessment::Question::TextResponsePoint.create(
            { group: trg, maximum_point_grade: tr.acting_as.maximum_grade }
          ) do |trp|
            trp.save!
            execute(<<-SQL)
              UPDATE course_assessment_question_text_response_solutions
              SET point_id=#{trp['id']}
              WHERE question_id=#{tr['id']}
            SQL
          end
        end
      end
    end

    populate_default_weights

    change_column_null :course_assessment_question_text_response_groups, :group_weight, false
    change_column_null :course_assessment_question_text_response_points, :point_weight, false
    change_column_null :course_assessment_question_text_response_solutions, :weight, false

    change_column_null :course_assessment_question_text_response_solutions,
                       :point_id, false

    remove_reference :course_assessment_question_text_response_solutions,
                     :question,
                     null: false,
                     index: {
                       name: :fk__course_assessment_text_response_solution_question
                     }
  end

  def down
    add_reference :course_assessment_question_text_response_solutions,
                  :question,
                  index: {
                    name: :fk__course_assessment_text_response_solution_question
                  }

    change_column_null :course_assessment_question_text_response_solutions,
                       :point_id, true
    change_column_null :course_assessment_question_text_response_solutions,
                       :solution, true

    change_column_null :course_assessment_question_text_response_solutions, :weight, true
    change_column_null :course_assessment_question_text_response_points, :point_weight, true
    change_column_null :course_assessment_question_text_response_groups, :group_weight, true

    clear_default_weights

    add_column :course_assessment_question_text_response_solutions,
               :solution_old, :text, null: true

    ActsAsTenant.without_tenant do
      Course::Assessment::Question::TextResponseSolution.all.each do |trs|
        execute(<<-SQL)
          UPDATE course_assessment_question_text_response_solutions
          SET question_id=#{trs.point.group.question.id},
              point_id=null,
              solution_old='#{trs.solution.first}',
              solution='{}'
          WHERE id=#{trs['id']}
        SQL
      end

      Course::Assessment::Question::TextResponsePoint.delete_all

      Course::Assessment::Question::TextResponseGroup.delete_all

      ActiveRecord::Base.connection.execute(
        "ALTER SEQUENCE course_assessment_question_text_response_points_id_seq
        RESTART WITH 1"
      )

      ActiveRecord::Base.connection.execute(
        "ALTER SEQUENCE course_assessment_question_text_response_groups_id_seq
        RESTART WITH 1"
      )
    end

    change_column_null :course_assessment_question_text_response_solutions,
                       :solution, false
    change_column_null :course_assessment_question_text_response_solutions,
                       :solution_old, false
    change_column_null :course_assessment_question_text_response_solutions,
                       :question_id, false
  end

  def populate_default_weights
    Course::Assessment::Question::TextResponse.includes(groups: [points: [:solutions]]).find_each do |question|
      groups = question.groups.sort_by(&:id)
      first_group_id = groups.first.id
      groups.each do |group|
        # Start numbering the weights from 1
        group.update_column(:group_weight, group.id - first_group_id + 1)
        points = group.points.sort_by(&:id)
        first_point_id = points.first.id

        points.each do |point|
          point.update_column(:point_weight, point.id - first_point_id + 1)
          solutions = point.solutions.sort_by(&:id)
          first_solution_id = solutions.first.id

          solutions.each do |solution|
            solution.update_column(:weight, solution.id - first_solution_id + 1)
          end
        end
      end
    end
  end

  def clear_default_weights
    Course::Assessment::Question::TextResponseSolution.update_all(weight: nil)
    Course::Assessment::Question::TextResponsePoint.update_all(point_weight: nil)
    Course::Assessment::Question::TextResponseGroup.update_all(group_weight: nil)
  end
end
