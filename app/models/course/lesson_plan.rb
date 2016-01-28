# frozen_string_literal: true
module Course::LessonPlan
  def self.table_name_prefix
    "#{Course.table_name.singularize}_lesson_plan_"
  end
end
