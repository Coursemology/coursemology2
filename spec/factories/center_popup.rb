FactoryGirl.define do
  factory :center_popup, class: Notification::CenterPopup.name do
    user
    course
    title 'example'
    content 'example'
    button_text 'Yay!'
    image_url 'example.png'
    link 'examples/example'
    sharable false
  end
end
