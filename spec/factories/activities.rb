FactoryGirl.define do
  factory :activity do
    actor
    object { create(:user) }
    event 'test'
  end
end
