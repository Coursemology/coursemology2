require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_users) }
  it { is_expected.to belong_to(:course).inverse_of(:course_users) }
  it { is_expected.to define_enum_for(:role) }
  it do
    is_expected.to have_many(:experience_points_records).
      inverse_of(:course_user).
      dependent(:destroy)
  end

  context 'when course_user is created' do
    subject { CourseUser.new }

    it { is_expected.to be_student }
    it { is_expected.not_to be_phantom }
  end
end
