require 'rails_helper'

RSpec.describe Course::EnrolRequest, :type => :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:user) { create(:user) }
    describe 'creating enrol request of the same user to the same course twice' do
      subject { create(:course_enrol_request, course: course, user: user, role: :student) }
      before do
        create(:course_enrol_request, course: course, user: user, role: :student)
      end
      it 'fails' do
        expect{ subject }.to change(Course::EnrolRequest, :count).by(0).and raise_error
      end
    end
  end
end
