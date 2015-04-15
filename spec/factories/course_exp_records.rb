FactoryGirl.define do
  factory :manual_exp_record, class: 'Course::ExpRecord' do
    creator
    updater
    course_user
    exp_awarded 100
    reason 'EXP for some event'
  end
end
