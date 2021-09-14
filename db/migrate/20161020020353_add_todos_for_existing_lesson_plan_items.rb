class AddTodosForExistingLessonPlanItems < ActiveRecord::Migration[4.2]
  def up
    Instance.all.each do |instance|
      ActsAsTenant.current_tenant = instance
      Course.all.each do |course|
        create_todos_for(course)
      end
    end
  end

  def down
    Course::LessonPlan::Todo.delete_all
  end

  def create_todos_for(course)
    # Submissions hash from course with the following format:
    #   { [submission.assessment.lesson_plan_item.id, creator_id]: '#{workflow_state}' }
    submissions_hash =
      Course::Assessment::Submission.
      from_course(course).
      includes(assessment: :lesson_plan_item).
      map do |s|
        [[s.assessment.lesson_plan_item.id, s.creator_id], s.workflow_state]
      end.to_h

    items = course.lesson_plan_items.where(actable_type: 'Course::Assessment').pluck(:id)
    course_users = course.course_users.where.not(user_id: nil).pluck(:user_id)

    # Populate an array of hashes with todo attributes for creation
    items.product(course_users).map! do |ary|
      workflow_state =
        case submissions_hash[ary]
        when nil
          'not_started'
        when 'attempting'
          'in_progress'
        when 'submitted', 'graded', 'published'
          'completed'
        end

      Course::LessonPlan::Todo.
        new(item_id: ary[0],
            user_id: ary[1],
            workflow_state: workflow_state,
            creator: User.system,
            updater: User.system).
        save!(validate: false)
    end
  end
end
