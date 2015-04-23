require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_users) }
  it { is_expected.to belong_to(:course).inverse_of(:course_users) }
  it { is_expected.to define_enum_for(:role) }
  it { is_expected.to have_many(:exp_records).inverse_of(:course_user).dependent(:destroy) }

  context 'when course_user is created' do
    subject { CourseUser.new }

    it { is_expected.to be_student }
    it { is_expected.not_to be_phantom }
  end

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    describe '#exp_points' do
      before do
        exp_record_1 = create :manual_exp_record
        @course_user = exp_record_1.course_user
        exp_record_2 = create :manual_exp_record, course_user: @course_user
        @exp_total = exp_record_1.exp_awarded + exp_record_2.exp_awarded
      end
      subject { @course_user.exp_points }
      it { is_expected.to eq @exp_total }
    end
  end
end
