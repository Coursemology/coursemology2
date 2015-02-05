require 'rails_helper'

RSpec.describe CourseUser, type: :model do
	it { should belong_to(:user).inverse_of(:course_users) }
	it { should belong_to(:course).inverse_of(:course_users) }

  context 'when course_user is created' do
    subject { CourseUser.new }

    it { is_expected.to be_student }
    it { is_expected.not_to be_phantom }
  end
end