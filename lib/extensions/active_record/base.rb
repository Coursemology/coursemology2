module Extensions::ActiveRecord::Base
  module ClassMethods
    def currently_valid
      where do
        (valid_from.nil? || valid_from <= Time.zone.now) &&
          (valid_to.nil? || valid_to >= Time.zone.now)
      end
    end

    # Functions from ActsAsAttachable framework.
    # This function should be declared in model, to it have attachments.
    def acts_as_attachable
      has_many :attachments, as: :attachable

      accepts_nested_attributes_for :attachments,
                                    allow_destroy: true,
                                    reject_if: -> (params) { params[:attachment].blank? }
    end

    # Decorator for items that give course_users EXP Points
    def acts_as_experience_points_record
      acts_as :experience_points_record, class_name: Course::ExperiencePointsRecord.name
      class_eval do
        def manual_exp?
          false
        end
      end
    end

    # Decorator for abstractions with concreate occurrences which have
    # the potential to award course_users EXP Points
    def acts_as_lesson_plan_item
      acts_as :lesson_plan_item, class_name: Course::LessonPlanItem.name
    end
  end

  # @return [Bool] True if valid_from is a future time
  def not_yet_valid?
    !valid_from.nil? && valid_from > Time.zone.now
  end

  # @return [Bool] True if current time is between valid_from and valid_to
  def currently_valid?
    (valid_from.nil? || valid_from <= Time.zone.now) &&
      (valid_to.nil? || valid_to >= Time.zone.now)
  end

  # @return [Bool] True if valid_to is a past time
  def expired?
    !valid_to.nil? && Time.zone.now > valid_to
  end
end
