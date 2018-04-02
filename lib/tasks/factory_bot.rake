# frozen_string_literal: true
namespace :factory_bot do
  desc 'Run Factory Bot Lint to make sure all factories in tests are valid'
  task lint: :environment do
    # Don't care if mailer cannot send
    ActionMailer::Base.raise_delivery_errors = false

    ActsAsTenant.with_tenant(Instance.default) do
      User.stamper = User.first
      FactoryBot.lint
    end
  end
end
