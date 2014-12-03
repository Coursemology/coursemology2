RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods

  # Check that the factories are all valid.
  config.before(:suite) do
    FactoryGirl.lint
  end
end
