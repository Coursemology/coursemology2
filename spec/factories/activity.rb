FactoryGirl.define do
  factory :activity do
    trackable_id nil
    trackable_type nil
    owner_id nil
    owner_type nil
    key nil
    parameters nil
    recipient_id nil
    recipient_type nil
    feed false
    email false
    popup false
  end
end
