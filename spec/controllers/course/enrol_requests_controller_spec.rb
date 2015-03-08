require 'rails_helper'

RSpec.describe Course::EnrolRequestsController, :type => :controller do
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let!(:instance_user) do
      result = InstanceUser.create(instance: instance, user: user)
      instance.reload
      user.reload
      result
    end
    let!(:course) { create(:course) }

    describe '#new' do
      subject { get new_course_enrol_request_path(course, role: 'student') }
      before do
        sign_in(user)
      end

      it 'should create a new request after first attempt' do
        subject
        expect(response).to render_template(:new)
        expect(assigns(:enrol_request)).to be_a_new(EnrolRequest)
      end

      it 'should not create a new request after subsequent attempts' do
        subject
        expect(response).to render_template(:new)
        expect(assigns(:enrol_request)).not_to be_a_new(EnrolRequest)
      end
    end
  end

end
