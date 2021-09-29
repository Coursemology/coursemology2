class RekeySidebarSettings < ActiveRecord::Migration[4.2]
  def up
    ActsAsTenant.without_tenant do
      Course.all.each do |course|
        weight = course.settings(:sidebar, :assessments).weight
        next unless weight

        course.assessment_categories.each do |c|
          course.settings(:sidebar).settings("assessments_#{c.id}").weight = weight
        end
        course.settings(:sidebar).assessments = nil
        course.save!
      end
    end
  end

  def down
    ActsAsTenant.without_tenant do
      Course.all.each do |course|
        weights = course.assessment_categories.map do |c|
          weight = course.settings(:sidebar).settings("assessments_#{c.id}").weight
          course.settings(:sidebar).send("assessments_#{c.id}=", nil)
          weight
        end
        next if weights.empty?

        weight = weights.first
        course.settings(:sidebar, :assessments).weight = weight
        course.save!
      end
    end
  end
end
