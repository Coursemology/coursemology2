# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::Videos::TabsController, type: :controller do
  let(:instance) do
    Instance.default.tap do |instance|
      instance.settings(:components).settings(:course_videos_component).enabled = true
      instance.save!
    end
  end
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) do
      create(:course, creator: user).tap do |course|
        course.settings(:components).settings(:course_videos_component).enabled = true
        course.save!
      end
    end
    let!(:tab_stub) do
      stub = create(:course_video_tab)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }
      context 'upon create failure' do
        before do
          controller.instance_variable_set(:@tab, tab_stub)
          subject
        end
        it { is_expected.to render_template(:new) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: tab_stub } }
      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@tab, tab_stub)
          subject
        end

        it { is_expected.to redirect_to(course_admin_videos_path(course)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to(eq(I18n.t('course.admin.videos.tabs.destroy.failure',
                                              error: '')))
        end
      end
    end
  end
end
