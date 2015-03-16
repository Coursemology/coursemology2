require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_users) }
  it { is_expected.to belong_to(:course).inverse_of(:course_users) }
  it { is_expected.to define_enum_for(:role) }

  context 'when course_user is created' do
    subject { CourseUser.new }

    it { is_expected.to be_student }
    it { is_expected.not_to be_phantom }
  end
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:student) { create(:course_student, course: course) }
    let!(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
    let!(:manager) { create(:course_manager, course: course) }
    let!(:owner) { create(:course_owner, course: course) }

    describe 'get staff scope' do
      it 'returns teaching assistant, manager and owner' do
        expect(course.course_users.staff).to contain_exactly(teaching_assistant, manager, owner)
      end
    end

    describe 'get student scope' do
      it 'returns only student' do
        expect(course.course_users.student).to contain_exactly(student)
      end
    end

    describe 'get teaching assistant scope' do
      it 'returns only teaching assistant' do
        expect(course.course_users.teaching_assistant).to contain_exactly(teaching_assistant)
      end
    end

    describe 'get manager scope' do
      it 'returns only manager' do
        expect(course.course_users.manager).to contain_exactly(manager)
      end
    end

    describe 'get owner scope' do
      it 'returns only owner' do
        expect(course.course_users.owner).to contain_exactly(owner)
      end
    end
  end
end
