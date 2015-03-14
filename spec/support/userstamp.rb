RSpec.configure do |config|
  config.before(:example) do
    User.stamper = build(:user)
  end
  config.after(:example) do
    User.reset_stamper
  end
end
