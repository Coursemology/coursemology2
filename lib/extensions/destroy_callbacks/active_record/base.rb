module Extensions::DestroyCallbacks::ActiveRecord::Base
  extend ActiveSupport::Concern

  included do
    around_destroy :update_status
  end

  # @return [boolean] True if the record is being destroyed.
  def destroying?
    @destroying
  end

  private

  def update_status
    @destroying = true
    yield
  ensure
    @destroying = false
  end
end
