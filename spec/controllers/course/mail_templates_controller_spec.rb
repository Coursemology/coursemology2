require 'rails_helper'

RSpec.describe Course::MailTemplatesController, :type => :controller do
  before do
    ActsAsTenant.current_tenant = Instance.default
    sign_in(create(:administrator))
  end
  let!(:course) { create(:course) }
  let(:existing) { create(:invitation, course: course) }
  let(:new_template) { build(:invitation, course: course).as_json }

  def expect_correct_response(redirect_path, controller_action)
    expect(response).to redirect_to(redirect_path)
    expect(flash[:notice]).
      to match(I18n.t("course.mail_templates.#{controller_action}.notice_format") %
                 { action: I18n.t("course.mail_templates.action.invitation") })
  end

  describe '#index' do
    subject { get :index, course_id: course.id }
    it { is_expected.to render_template(:index) }
  end

  describe '#new' do
    subject { get :new, course_id: course.id }
    it { is_expected.to render_template(:new) }
  end

  describe '#create' do
    it 'creates a new mail template and redirects to the edit page' do
      expect { post :create, course_id: course.id, mail_template: new_template }.
        to change(Course::MailTemplate, :count).by(1)
      expect_correct_response(edit_course_mail_template_path(course, Course::MailTemplate.all.last),
                              'create')
    end
  end

  describe '#edit' do
    subject { get :edit, course_id: course.id, id: existing.id }
    it { is_expected.to render_template(:edit) }
  end

  describe '#update' do
    subject { put :update, course_id: course.id, id: existing.id, mail_template: @updated.as_json }
    context 'new value is valid' do
      before do
        @updated = build(:invitation, course: course, subject: 'New subject')
      end

      it 'updates the existing record' do
        expect { subject; existing.reload }.to change(existing, :subject).to(@updated.subject)
        expect_correct_response(edit_course_mail_template_path(course, existing), 'update')
      end
    end

    context 'new value is invalid' do
      before do
        create(:announcement)
        @updated = build(:invitation, course: course, action: 'announcement')
      end

      it 'does not update the existing record' do
        expect { subject; existing.reload }.not_to change(existing, :action)
        expect_correct_response(edit_course_mail_template_path(course, existing), 'update')
      end
    end
  end

  describe '#destroy' do
    subject { delete :destroy, course_id: course.id, id: existing.id }
    before do
      existing
    end
    it 'destroys an existing record' do
      expect { subject }.to change(Course::MailTemplate, :count).by(-1)
      expect_correct_response(course_mail_templates_path(course), 'destroy')
    end
  end
end
