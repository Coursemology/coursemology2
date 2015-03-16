require 'rails_helper'

RSpec.describe Course::EnrolRequest, :type => :model do
  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:course) }
  it { is_expected.to define_enum_for(:role) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:user) { create(:user) }
    let!(:student) { create(:student_enrol_request, course: course) }
    let!(:teaching_assistant) { create(:teaching_assistant_enrol_request, course: course) }
    let!(:manager) { create(:manager_enrol_request, course: course) }
    let!(:owner) { create(:owner_enrol_request, course: course) }

    describe 'creating enrol request of the same user to the same course twice' do
      subject { create(:course_enrol_request, course: course, user: user, role: :student) }
      before do
        create(:course_enrol_request, course: course, user: user, role: :student)
      end
      it 'fails' do
        expect{ subject }.to change(Course::EnrolRequest, :count).by(0).and raise_error
      end
    end

    describe 'get student scope' do
      it 'returns student enrol requests' do
        expect(course.enrol_requests.student).to contain_exactly(student)
      end
    end

    describe 'get staff scope' do
      it 'returns teaching assistant, manager and owner enrol requests' do
        expect(course.enrol_requests.staff).to contain_exactly(teaching_assistant, manager, owner)
      end
    end

    describe 'approve enrol request' do
      it 'create a new course user' do
        expect { student.approve! }.to change(CourseUser, :count).by(1)
      end
    end

    describe 'approve enrol request with an existing course user' do
      before do
        student.approve!
      end

      it 'does not create a new course user' do
        expect { student.approve! }.not_to change(CourseUser, :count)
      end
    end
  end
end
