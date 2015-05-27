FactoryGirl.define do
  factory :activity do
    trackable_id nil
    trackable_type 'test'
    owner_id nil
    owner_type 'test'
    key 'test'
    parameters nil
    recipient_id nil
    recipient_type 'test'
  end
end
