require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  context 'when course_user is created' do
    subject { CourseUser.new }

    it { is_expected.to be_student }
    it { is_expected.not_to be_phantom }
  end
end
