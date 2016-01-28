# frozen_string_literal: true
# Test helpers for ApplicationMailer
module ApplicationMailer::TestGroupHelpers
  # prepend template path '../fixtures/' in ApplicationMailer
  def self.extended(module_)
    module_.module_eval do
      before(:all) do
        ApplicationMailer.prepend_view_path(File.join(__dir__, '../fixtures/'))
      end
    end
  end
end

RSpec.configure do |config|
  config.extend ApplicationMailer::TestGroupHelpers, type: :notifier
  config.extend ApplicationMailer::TestGroupHelpers, type: :mailer
end
