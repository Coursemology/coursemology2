require 'rails_helper'

RSpec.describe Course, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:creator) }
    it { is_expected.to have_many(:course_users).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:announcements).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:levels).inverse_of(:course).dependent(:destroy) }

    it { is_expected.to validate_presence_of(:title) }

    context 'when course is created' do
      subject { Course.new }

      it { is_expected.not_to be_published }
      it { is_expected.not_to be_opened }
    end

    describe '#staff' do
      let(:course) { create(:course) }
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let(:manager) { create(:course_manager, course: course) }
      let(:owner) { create(:course_owner, course: course) }

      it 'returns all the staff in course' do
        expect(course.staff).to contain_exactly(teaching_assistant, manager, owner)
      end
    end
  end
end
