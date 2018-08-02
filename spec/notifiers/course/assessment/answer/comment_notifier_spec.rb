# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::CommentNotifier, type: :notifier do
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

    describe '#annotation_replied' do
      let(:user) { create(:user) }
      let(:course) { create(:course) }
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

      before { code_annotation.acting_as.ensure_subscribed_by(user) }
      subject { Course::Assessment::Answer::CommentNotifier.annotation_replied(post) }

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
