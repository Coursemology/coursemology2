FactoryGirl.define do
  factory :notification do
    user
    course
    type ''
    title 'example'
    content 'example'
    image 'example.png'
    link 'examples/example'
    share false
  end
end
