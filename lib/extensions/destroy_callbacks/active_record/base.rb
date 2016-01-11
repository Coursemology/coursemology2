module Extensions::DestroyCallbacks::ActiveRecord::Base
  extend ActiveSupport::Concern

  module ClassMethods
    def actable(*args)
      args.unshift({}) if args.empty?
      options = args.extract_options!
      args.push(options.reverse_merge(dependent: :destroy))
      super(*args)
    end
  end

  included do
    around_destroy :update_status
  end

  # @return [Boolean] True if the record is being destroyed.
  def destroying?
    @destroying
  end

  private

  def update_status
    return if destroying? # Works around Rails #13609
    @destroying = true
    yield
  ensure
    @destroying = false
  end
end
