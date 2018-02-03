# frozen_string_literal: true
class RenameAssessmentOpenedEmailSettingsKey < ActiveRecord::Migration[4.2]
  def change_assessment_email_key(old_key, new_key)
    ActsAsTenant.without_tenant do
      Course.all.each do |course|
        course.settings.course_assessments_component&.each do |category_id, value|
          next unless value['emails'] && !value['emails'][old_key].nil?
          settings = course.settings(:course_assessments_component, category_id, :emails)
          settings.public_send("#{new_key}=", value['emails'][old_key])
          settings.public_send("#{old_key}=", nil)
          course.save!
        end
      end
    end
  end

  def up
    change_assessment_email_key('assessment_opened', 'assessment_opening')
  end

  def down
    change_assessment_email_key('assessment_opening', 'assessment_opened')
  end
end
