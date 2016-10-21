# frozen_string_literal: true

# Rails #13609 has been fixed in https://github.com/rails/rails/pull/18548, this files does the
# patch for rails 4.2.
module Extensions::DestroyCallbacks::ActiveRecord::Callbacks
  def self.included(base)
    base.module_eval do
      def destroy
        @_destroy_callback_already_called ||= false
        return if @_destroy_callback_already_called
        @_destroy_callback_already_called = true
        _run_destroy_callbacks { super }
      ensure
        @_destroy_callback_already_called = false
      end
    end
  end
end
