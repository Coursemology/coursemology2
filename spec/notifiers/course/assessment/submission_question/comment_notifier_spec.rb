# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionQuestion::CommentNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:settings_context) do
      OpenStruct.new(key: Course::AssessmentsComponent.key, current_course: course)
    end

    def set_assessment_notification_key(course, category_id, key, value)
      setting = { 'key' => key, 'enabled' => value, 'options' => { 'category_id' => category_id } }
      Course::Settings::AssessmentsComponent.new(settings_context).update_email_setting(setting)
      course.save!
    end

    describe '#post_replied' do
      let(:user) { create(:user) }
      let(:course) { create(:course) }
      let(:course_user) { create(:course_user, course: course, user: user) }
      let(:other_user) { create(:course_user, course: course).user }
      let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }
      let(:category_id) { assessment.tab.category_id }
      let(:submission_question) do
        sub = create(:submission, assessment: assessment, course_user: course_user, creator: user)
        create(:course_assessment_submission_question,
               submission: sub, question: assessment.questions.first)
      end
      let(:post) do
        create(:course_discussion_post, topic: submission_question.acting_as, creator: other_user)
      end

      before { submission_question.acting_as.ensure_subscribed_by(user) }
      subject { Course::Assessment::SubmissionQuestion::CommentNotifier.post_replied(post) }

      it 'sends email notifications' do
        expect { subject }.to change(ActionMailer::Base.deliveries, :count).by(1)
      end

      context 'when "new phantom comment" is disabled and a phantom user posts a comment' do
        let(:other_user) { create(:course_user, :phantom, course: course).user }
        before do
          set_assessment_notification_key(course, category_id, 'new_phantom_comment', false)
        end

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "new comment" is disabled' do
        before { set_assessment_notification_key(course, category_id, 'new_comment', false) }

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        context 'when "new phantom comment" is enabled and a phantom user posts a comment' do
          let(:other_user) { create(:course_user, :phantom, course: course).user }
          before do
            set_assessment_notification_key(course, category_id, 'new_phantom_comment', true)
          end

          it 'does not send email notifications' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end
        end
      end
    end
  end
end
