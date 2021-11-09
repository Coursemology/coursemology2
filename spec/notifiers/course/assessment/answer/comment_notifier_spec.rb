# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::CommentNotifier, type: :mailer do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    def set_assessment_email_setting(course, category_id, setting, regular, phantom)
      email_setting = course.
                      setting_emails.
                      where(component: :assessments,
                            course_assessment_category_id: category_id,
                            setting: setting).first
      email_setting.update!(regular: regular, phantom: phantom)
    end

    describe '#annotation_replied' do
      let(:user) { create(:user) }
      let(:course) { create(:course) }
      let(:course_creator) { course.course_users.first }
      let(:course_user) { create(:course_user, course: course, user: user) }
      let(:other_user) { create(:course_user, course: course).user }
      let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
      let(:category_id) { assessment.tab.category_id }
      let(:programming_file) do
        sub = create(:submission, assessment: assessment, course_user: course_user, creator: user)
        ans = create(:course_assessment_answer_programming, question: assessment.questions.first,
                                                            file_count: 1, submission: sub)
        ans.files.first
      end
      let(:code_annotation) do
        create(:course_assessment_answer_programming_file_annotation, :with_post,
               file: programming_file, course: course)
      end
      let(:post) do
        create(:course_discussion_post, topic: code_annotation.acting_as, creator: other_user)
      end

      before do
        code_annotation.acting_as.ensure_subscribed_by(user)
        code_annotation.acting_as.ensure_subscribed_by(course_creator.user)
      end
      subject { Course::Assessment::Answer::CommentNotifier.annotation_replied(post) }

      it 'sends email notifications' do
        expect { subject }.to change(ActionMailer::Base.deliveries, :count).by(2)
      end

      context 'when a user unsubscribes' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: category_id,
                                setting: :new_comment).first
          course_creator.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when "new comment" email setting is disabled for regular users' do
        before { set_assessment_email_setting(course, category_id, 'new_comment', false, true) }

        it 'does not send email notifications to the regular users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sends email notifications to phantom users' do
          course_user.update!(phantom: true)
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when "new comment" email setting is disabled for phantom users' do
        before { set_assessment_email_setting(course, category_id, 'new_comment', true, false) }

        it 'does not send email notifications to the phantom users but sends email notifications to regular users' do
          course_user.update!(phantom: true)
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when "new comment" email setting is disabled' do
        before { set_assessment_email_setting(course, category_id, 'new_comment', false, false) }

        it 'does not send email notifications to everyone' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
