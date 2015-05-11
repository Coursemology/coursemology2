FactoryGirl.define do
  factory :notification do
    user
    course
    type ''
    title 'example'
    content 'example'
    button_text 'Yay!'
    image_url 'example.png'
    link 'examples/example'
    sharable false
  end
end
