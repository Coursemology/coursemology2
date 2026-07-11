# frozen_string_literal: true
class Course::Assessment::Marketplace::ContainerCourseService
  TITLE = 'Marketplace Previews (system)'

  def self.find_or_create!(instance:, creator:)
    new(instance, creator).find_or_create!
  end

  def initialize(instance, creator)
    @instance = instance
    @creator = creator
  end

  def find_or_create!
    ActsAsTenant.with_tenant(@instance) do
      existing = Course.find_by(instance: @instance, title: TITLE)
      next existing if existing

      # Course.new builds the default assessment category (and, through the category,
      # its initial tab) via Course::ModelComponentHost's after_initialize hook. Those
      # nested records take their creator/updater from the stamper, which a service has
      # to set for itself.
      User.with_stamper(@creator) do
        Course.create!(instance: @instance, title: TITLE,
                       description: 'System course hosting marketplace preview attempts.',
                       creator: @creator, updater: @creator)
      end
    end
  end
end
