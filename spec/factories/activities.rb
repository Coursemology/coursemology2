FactoryGirl.define do
  factory :activity do
    actor
    object { create(:user) }
    event 'test'
    course
    notifier_type 'test_notifier'
  end
end
