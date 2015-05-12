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

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    describe '#exp_points' do
      let!(:exp_record_1) { create(:course_experience_points_record) }
      let!(:exp_record_2) do
        create(:course_experience_points_record, course_user: exp_record_1.course_user)
      end
      subject { exp_record_1.course_user }
      it 'sums all associated experience points records' do
        points_awarded = exp_record_1.points_awarded + exp_record_2.points_awarded
        expect(subject.experience_points).to eq(points_awarded)
      end
    end
  end
end
