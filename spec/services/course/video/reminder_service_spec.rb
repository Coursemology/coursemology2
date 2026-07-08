# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:student) { create(:course_student, course: course) }
    let!(:student_phantom) { create(:course_student, :phantom, course: course) }

    def set_video_email_setting(regular, phantom)
      email_setting = course.setting_emails.
                      where(component: :videos,
                            course_assessment_category_id: nil,
                            setting: :closing_reminder).first
      email_setting.update!(regular: regular, phantom: phantom)
    end

    describe '#closing_reminder' do
      let!(:now) { Time.zone.now }

      let!(:video) { create(:video, course: course, end_at: now) }

      context 'when video is published' do
        it 'sends reminder emails to unattempted students' do
          video.published = true

          expect(Course::Mailer).to receive(:video_closing_reminder_email).
            exactly(2).times.and_return(double(deliver_later: nil))
          subject.closing_reminder(video, video.closing_reminder_token)
        end
      end

      context 'when video is a draft' do
        it 'does not send any emails' do
          expect(Course::Mailer).not_to receive(:video_closing_reminder_email)
          subject.closing_reminder(video, video.closing_reminder_token)
        end

        context "when video's end_at was changed" do
          it 'does not send any emails' do
            video.end_at = now + 1.day

            expect(Course::Mailer).not_to receive(:video_closing_reminder_email)
            subject.closing_reminder(video, video.closing_reminder_token)
          end
        end
      end

      context 'when video is published and email settings vary' do
        before { video.update!(published: true) }

        let(:recipients) { [] }
        before do
          allow(Course::Mailer).to receive(:video_closing_reminder_email) do |recipient, _|
            recipients << recipient
            double(deliver_later: nil)
          end
        end

        context 'when phantom emails are disabled' do
          before { set_video_email_setting(true, false) }

          it 'only emails regular students' do
            subject.closing_reminder(video, video.closing_reminder_token)
            expect(recipients).to include(student.user)
            expect(recipients).not_to include(student_phantom.user)
          end
        end

        context 'when regular emails are disabled' do
          before { set_video_email_setting(false, true) }

          it 'only emails phantom students' do
            subject.closing_reminder(video, video.closing_reminder_token)
            expect(recipients).not_to include(student.user)
            expect(recipients).to include(student_phantom.user)
          end
        end

        context 'when all closing reminder emails are disabled' do
          before { set_video_email_setting(false, false) }

          it 'does not send any emails' do
            subject.closing_reminder(video, video.closing_reminder_token)
            expect(recipients).to be_empty
          end
        end
      end
    end
  end
end
