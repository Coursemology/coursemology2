FactoryGirl.define do
  factory :right_side_popup, class: Notification::RightSidePopup.name do
    user
    course
    title 'example'
    content 'example'
    image_url 'example.png'
    link 'examples/example'
    sharable false
  end
end
