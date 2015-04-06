FactoryGirl.define do
  factory :center_popup do
    user
    course
    title 'example'
    content 'example'
    image 'example.png'
    link 'examples/example'
    share false
  end
end
