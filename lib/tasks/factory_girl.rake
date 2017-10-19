namespace :factory_girl do
  desc 'Run Factory Girl Lint to make sure all factories in tests are valid'
  task lint: :environment do
    # Don't care if mailer cannot send
    ActionMailer::Base.raise_delivery_errors = false

    ActsAsTenant.with_tenant(Instance.default) do
      User.stamper = User.first
      FactoryGirl.lint
    end
  end
end
