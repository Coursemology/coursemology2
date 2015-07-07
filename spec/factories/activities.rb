FactoryGirl.define do
  factory :activity do
    actor
    object { create(:user) }
    event 'test'
    notifier_type 'test_notifier'
  end
end
