require 'rails_helper'

RSpec.describe Course::MailTemplatesController, :type => :controller do
  before do
    ActsAsTenant.current_tenant = Instance.default
    sign_in(create(:administrator))
  end
  let!(:course) { create(:course) }
  let!(:existing) { create(:invitation, course: course) }
  let(:new_template) { build(:announcement, course: course).as_json }

  def expect_correct_response(redirect_path, controller_action, options = {})
    expect(response).to redirect_to(redirect_path)
    if options[:mail_action]
      expect(flash[:notice]).
        to match(I18n.t("course.mail_templates.#{controller_action}.notice_format") %
                   { action: I18n.t("course.mail_templates.action.#{options[:mail_action]}") })
    elsif options[:error]
      expect(flash[:error]).
        to match(I18n.t("course.mail_templates.#{controller_action}.error_format") %
                   { reason: options[:error] })
    end
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
      expect { post :create, course_id: course.id, course_mail_template: new_template }.
        to change(Course::MailTemplate, :count).by(1)
      expect_correct_response(edit_course_mail_template_path(course, Course::MailTemplate.all.last),
                              'create',
                              { mail_action: 'announcement' })
    end
  end

  describe '#edit' do
    subject { get :edit, course_id: course.id, id: existing.id }
    it { is_expected.to render_template(:edit) }
  end

  describe '#update' do
    subject do
      put :update,
          course_id: course.id,
        id: existing.id,
        course_mail_template: @updated.as_json
    end
    context 'new value is valid' do
      before do
        @updated = build(:invitation, course: course, subject: 'New subject')
      end

      it 'updates the existing record' do
        expect do
          subject
          existing.reload
        end.to change(existing, :subject).to(@updated.subject)
        expect_correct_response(edit_course_mail_template_path(course, existing),
                                'update',
                                { mail_action: 'invitation' })
      end
    end

    context 'new value is invalid' do
      before do
        create(:announcement, course: course)
        @updated = build(:invitation, course: course, action: 'announcement')
        request.env['HTTP_REFERER'] = edit_course_mail_template_path(course, existing)
      end

      it 'does not update the existing record' do
        expect do
          subject
          existing.reload
        end.not_to change(existing, :action)
        expect_correct_response(edit_course_mail_template_path(course, existing),
                                'update',
                                { error: 'Validation failed: Action has already been taken' })
      end
    end
  end

  describe '#destroy' do
    subject { delete :destroy, course_id: course.id, id: existing.id }
    it 'destroys an existing record' do
      expect { subject }.to change(Course::MailTemplate, :count).by(-1)
      expect_correct_response(course_mail_templates_path(course),
                              'destroy',
                              { mail_action: 'invitation' })
    end
  end
end
